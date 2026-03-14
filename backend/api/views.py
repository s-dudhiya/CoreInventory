from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    RegisterSerializer,
    RequestOTPResetSerializer,
    VerifyOTPAndResetPasswordSerializer,
    UserSerializer
)
from .models import OTP, generate_otp

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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
                
                # Send email (prints to console initially due to settings)
                send_mail(
                    'CoreInventory - Your Password Reset OTP',
                    f'Your OTP for password reset is: {code}\nThis code will expire in 10 minutes.',
                    settings.DEFAULT_FROM_EMAIL or 'noreply@coreinventory.com',
                    [email],
                    fail_silently=False,
                )
            
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
