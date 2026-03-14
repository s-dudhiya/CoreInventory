from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    RequestPasswordResetOTPView,
    VerifyOTPAndResetPasswordView,
    DashboardKPIView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/me/', UserProfileView.as_view(), name='auth_me'),
    path('auth/password-reset/request/', RequestPasswordResetOTPView.as_view(), name='auth_request_password_reset'),
    path('auth/password-reset/verify/', VerifyOTPAndResetPasswordView.as_view(), name='auth_verify_password_reset'),
    
    path('dashboard/', DashboardKPIView.as_view(), name='dashboard_kpis'),
]
