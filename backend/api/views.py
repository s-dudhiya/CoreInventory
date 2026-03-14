from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Sum, Count, F
from django.db.models.functions import Coalesce
from .serializers import (
    RegisterSerializer,
    RequestOTPResetSerializer,
    VerifyOTPAndResetPasswordSerializer,
    UserSerializer, CategorySerializer, UnitOfMeasureSerializer,
    WarehouseSerializer, LocationSerializer, ProductSerializer,
    StockSerializer, SupplierSerializer, ReceiptSerializer,
    DeliveryOrderSerializer, InternalTransferSerializer,
    StockMoveSerializer, InventoryAdjustmentSerializer,
    SystemSettingSerializer
)
from .models import (
    OTP, generate_otp, Product, Receipt, 
    DeliveryOrder, InternalTransfer, Stock, Warehouse, StockMove,
    Category, UnitOfMeasure, Location, Supplier, InventoryAdjustment,
    SystemSetting
)

def set_jwt_cookies(response, user):
    refresh = RefreshToken.for_user(user)
    response.set_cookie(
        key='access_token',
        value=str(refresh.access_token),
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax'
    )
    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax'
    )
    return response

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response = Response({"message": "User created successfully", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
            return set_jwt_cookies(response, user)
            
        print("Registration Validation Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            response = Response({"message": "Login successful", "user": UserSerializer(user).data}, status=status.HTTP_200_OK)
            return set_jwt_cookies(response, user)
            
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        # Clear cookies by setting them to empty and expired
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        return response

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        print("Profile Update Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().select_related('profile')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]




class RequestPasswordResetOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestOTPResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                # Invalidate old OTPs
                OTP.objects.filter(user=user, is_used=False).update(is_used=True)
                
                # Create true new OTP
                code = generate_otp()
                OTP.objects.create(user=user, code=code)
                
                # Send email
                try:
                    send_mail(
                        'Stockora - Your Password Reset OTP',
                        f'Your OTP for password reset is: {code}\nThis code will expire in 10 minutes.',
                        settings.DEFAULT_FROM_EMAIL or 'noreply@stockora.com',
                        [email],
                        fail_silently=False,
                    )
                except Exception as e:
                    print(f"Error sending email: {e}")
                    return Response({"error": "Failed to send reset email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Always return 200 to prevent email enumeration
            return Response({"message": "If an account with that email exists, an OTP has been sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPAndResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPAndResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            user = User.objects.filter(email=email).first()
            if not user:
                return Response({"error": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)
                
            otp_record = OTP.objects.filter(user=user, code=code, is_used=False).order_by('-created_at').first()
            
            if not otp_record or not otp_record.is_valid():
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Valid OTP - Update passing and mark used
            user.set_password(new_password)
            user.save()
            otp_record.is_used = True
            otp_record.save()
            
            return Response({"message": "Password reset successfully!"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardKPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get settings for low stock threshold
        settings = SystemSetting.objects.first()
        threshold = settings.low_stock_threshold if settings else 15

        # Top-line KPI Counts
        total_products = Product.objects.count()
        
        # Calculate exactly how many products have total stock < threshold
        low_stock_items = Product.objects.annotate(
            total_qty=Coalesce(Sum('stock__quantity'), 0)
        ).filter(total_qty__lt=threshold).count()
        
        # Pending activity
        pending_receipts = Receipt.objects.exclude(status__in=['done', 'cancel']).count()
        pending_deliveries = DeliveryOrder.objects.exclude(status__in=['done', 'cancel']).count()
        internal_transfers = InternalTransfer.objects.exclude(status__in=['done', 'cancel']).count()

        # Stock Levels by Category (for Recharts BarChart)
        categories = Stock.objects.values(category_name=F('product__category__name')).annotate(total_stock=Sum('quantity'))
        bar_data = [
            {"category": item['category_name'] or 'Uncategorized', "stock": item['total_stock'] or 0} 
            for item in categories
        ]

        # Warehouse Distribution (for Recharts PieChart)
        warehouse_stats = Stock.objects.values(warehouse_name=F('location__warehouse__name')).annotate(total_stock=Sum('quantity'))
        
        total_quantity = sum(item['total_stock'] or 0 for item in warehouse_stats)
        
        pie_data = []
        for item in warehouse_stats:
            stock = item['total_stock'] or 0
            if total_quantity > 0:
                percentage = round((stock / total_quantity) * 100)
                pie_data.append({
                    "name": item['warehouse_name'] or 'Unknown',
                    "value": percentage
                })

        # Recent Activity
        recent_moves = StockMove.objects.select_related('product', 'location').order_by('-created_at')[:5]
        activity_data = []
        for move in recent_moves:
            activity_data.append({
                "id": f"MOV-{move.id:03d}",
                "product": move.product.name,
                "location": f"{move.location.name} ({move.location.warehouse.name})",
                "qty": f"{'+' if move.quantity_change > 0 else ''}{move.quantity_change}",
                "type": move.get_move_type_display(),
                "status": "done", # StockMove entries are typically finalized moves
                "date": move.created_at.strftime("%Y-%m-%d")
            })

        return Response({
            "kpi": {
                "total_products": total_products,
                "low_stock_items": low_stock_items,
                "pending_receipts": pending_receipts,
                "pending_deliveries": pending_deliveries,
                "internal_transfers": internal_transfers
            },
            "charts": {
                "bar_data": bar_data,
                "pie_data": pie_data
            },
            "recent_activity": activity_data
        }, status=status.HTTP_200_OK)

# -----------------------------
# CORE INVENTORY VIEWSETS
# -----------------------------

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class UnitOfMeasureViewSet(viewsets.ModelViewSet):
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer
    permission_classes = [IsAuthenticated]

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().prefetch_related('stock_set', 'stock_set__location', 'stock_set__location__warehouse')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

# -----------------------------
# OPERATIONS VIEWSETS
# -----------------------------

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.all().prefetch_related('items', 'items__product')
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        receipt = self.get_object_or_404(Receipt, pk=pk)
        if receipt.status == 'done':
            return Response({'error': 'Already finalized'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Add items to stock
            for item in receipt.items.all():
                stock, created = Stock.objects.get_or_create(
                    product=item.product,
                    location=receipt.warehouse.location_set.first() # Default to first location for simplicity
                )
                stock.quantity += item.quantity
                stock.save()
                
                # Log move
                StockMove.objects.create(
                    product=item.product,
                    location=stock.location,
                    quantity_change=item.quantity,
                    move_type='receipt',
                    reference_id=f"REC-{receipt.id}"
                )
            
            receipt.status = 'done'
            receipt.save()
            
        return Response({'status': 'finalized'})
    
    def get_object_or_404(self, model, pk):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(model, pk=pk)


class DeliveryOrderViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOrder.objects.all().prefetch_related('items', 'items__product')
    serializer_class = DeliveryOrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        delivery = self.get_object_or_404(DeliveryOrder, pk=pk)
        if delivery.status == 'done':
            return Response({'error': 'Already finalized'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            for item in delivery.items.all():
                # Deduct from first available location in that warehouse
                stock = Stock.objects.filter(product=item.product, location__warehouse=delivery.warehouse).first()
                if not stock or stock.quantity < item.quantity:
                    return Response({'error': f'Insufficient stock for {item.product.name}'}, status=status.HTTP_400_BAD_REQUEST)
                
                stock.quantity -= item.quantity
                stock.save()
                
                # Log move
                StockMove.objects.create(
                    product=item.product,
                    location=stock.location,
                    quantity_change=-item.quantity,
                    move_type='delivery',
                    reference_id=f"DEL-{delivery.id}"
                )
            
            delivery.status = 'done'
            delivery.save()
            
        return Response({'status': 'finalized'})
    
    def get_object_or_404(self, model, pk):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(model, pk=pk)


class InternalTransferViewSet(viewsets.ModelViewSet):
    queryset = InternalTransfer.objects.all().prefetch_related('items', 'items__product')
    serializer_class = InternalTransferSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        transfer = self.get_object_or_404(InternalTransfer, pk=pk)
        if transfer.status == 'done':
            return Response({'error': 'Already finalized'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            for item in transfer.items.all():
                # Out from old location
                source_stock = Stock.objects.filter(product=item.product, location=transfer.from_location).first()
                if not source_stock or source_stock.quantity < item.quantity:
                    return Response({'error': f'Insufficient stock at source for {item.product.name}'}, status=status.HTTP_400_BAD_REQUEST)
                
                source_stock.quantity -= item.quantity
                source_stock.save()
                
                # In to new location
                dest_stock, created = Stock.objects.get_or_create(product=item.product, location=transfer.to_location)
                dest_stock.quantity += item.quantity
                dest_stock.save()
                
                # Log moves
                StockMove.objects.create(
                    product=item.product, location=transfer.from_location,
                    quantity_change=-item.quantity, move_type='transfer', reference_id=f"TRF-{transfer.id}"
                )
                StockMove.objects.create(
                    product=item.product, location=transfer.to_location,
                    quantity_change=item.quantity, move_type='transfer', reference_id=f"TRF-{transfer.id}"
                )
            
            transfer.status = 'done'
            transfer.save()
            
        return Response({'status': 'finalized'})
    
    def get_object_or_404(self, model, pk):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(model, pk=pk)


class StockMoveViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMove.objects.all().select_related('product', 'location', 'location__warehouse').order_by('-created_at')
    serializer_class = StockMoveSerializer
    permission_classes = [IsAuthenticated]

class InventoryAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = InventoryAdjustment.objects.all().select_related('product', 'location').order_by('-created_at')
    serializer_class = InventoryAdjustmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(adjusted_by=self.request.user)

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj, created = SystemSetting.objects.get_or_create(id=1)
        return obj

    def list(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)



