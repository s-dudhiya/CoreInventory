from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    UserProfile, Category, UnitOfMeasure, Warehouse, 
    Location, Product, Stock, Receipt, ReceiptItem,
    DeliveryOrder, DeliveryItem, InternalTransfer, TransferItem,
    Supplier, StockMove, InventoryAdjustment
)

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return 'warehouse_staff'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            # Join all validation error messages into a single string
            raise serializers.ValidationError(" ".join(e.messages))
        return value
        
    def create(self, validated_data):
        role_data = validated_data.pop('role', 'warehouse_staff')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Update the implicitly created profile
        user.profile.role = role_data
        user.profile.save()
        
        return user

class RequestOTPResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class VerifyOTPAndResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, max_length=6)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

# -----------------------------
# CORE INVENTORY SERIALIZERS
# -----------------------------

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class UnitOfMeasureSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitOfMeasure
        fields = ['id', 'name', 'symbol']

class WarehouseSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    location_count = serializers.SerializerMethodField()
    manager_name = serializers.CharField(source='manager.username', read_only=True)

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'address', 'manager', 'manager_name', 'product_count', 'location_count']

    def get_product_count(self, obj):
        return Stock.objects.filter(location__warehouse=obj).values('product').distinct().count()

    def get_location_count(self, obj):
        return obj.location_set.count()

class LocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    
    class Meta:
        model = Location
        fields = ['id', 'warehouse', 'warehouse_name', 'name']

class StockSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    warehouse_name = serializers.CharField(source='location.warehouse.name', read_only=True)
    
    class Meta:
        model = Stock
        fields = ['id', 'location', 'location_name', 'warehouse_name', 'quantity']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    total_stock = serializers.SerializerMethodField()
    stocks = StockSerializer(source='stock_set', many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category', 'category_name', 
            'unit', 'unit_name', 'initial_stock', 'total_stock', 'stocks'
        ]

    def get_total_stock(self, obj):
        return sum(s.quantity for s in obj.stock_set.all())

# -----------------------------
# OPERATIONS SERIALIZERS
# -----------------------------

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'email', 'phone']

class ReceiptItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = ReceiptItem
        fields = ['id', 'product', 'product_name', 'quantity']

class ReceiptSerializer(serializers.ModelSerializer):
    items = ReceiptItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id', 'supplier', 'supplier_name', 'warehouse', 'warehouse_name',
            'created_by', 'created_by_name', 'status', 'created_at', 'items'
        ]

class DeliveryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = DeliveryItem
        fields = ['id', 'product', 'product_name', 'quantity']

class DeliveryOrderSerializer(serializers.ModelSerializer):
    items = DeliveryItemSerializer(many=True, read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = DeliveryOrder
        fields = [
            'id', 'customer_name', 'warehouse', 'warehouse_name',
            'created_by', 'created_by_name', 'status', 'created_at', 'items'
        ]

class TransferItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = TransferItem
        fields = ['id', 'product', 'product_name', 'quantity']

class InternalTransferSerializer(serializers.ModelSerializer):
    items = TransferItemSerializer(many=True, read_only=True)
    from_location_name = serializers.CharField(source='from_location.name', read_only=True)
    to_location_name = serializers.CharField(source='to_location.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = InternalTransfer
        fields = [
            'id', 'from_location', 'from_location_name', 'to_location', 'to_location_name',
            'created_by', 'created_by_name', 'status', 'created_at', 'items'
        ]

class StockMoveSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    warehouse_name = serializers.CharField(source='location.warehouse.name', read_only=True)
    move_type_display = serializers.CharField(source='get_move_type_display', read_only=True)

    class Meta:
        model = StockMove
        fields = [
            'id', 'product', 'product_name', 'location', 'location_name', 
            'warehouse_name', 'quantity_change', 'move_type', 'move_type_display',
            'reference_id', 'created_at'
        ]

class InventoryAdjustmentSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    adjusted_by_name = serializers.CharField(source='adjusted_by.username', read_only=True)

    class Meta:
        model = InventoryAdjustment
        fields = [
            'id', 'product', 'product_name', 'location', 'location_name',
            'recorded_quantity', 'counted_quantity', 'reason', 
            'adjusted_by', 'adjusted_by_name', 'created_at'
        ]



