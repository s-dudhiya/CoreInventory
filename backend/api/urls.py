from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    RequestPasswordResetOTPView,
    VerifyOTPAndResetPasswordView,
    DashboardKPIView,
    CategoryViewSet,
    UnitOfMeasureViewSet,
    WarehouseViewSet,
    LocationViewSet,
    ProductViewSet,
    SupplierViewSet,
    ReceiptViewSet,
    DeliveryOrderViewSet,
    InternalTransferViewSet,
    StockMoveViewSet,
    InventoryAdjustmentViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'units', UnitOfMeasureViewSet)
router.register(r'warehouses', WarehouseViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'products', ProductViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'receipts', ReceiptViewSet)
router.register(r'deliveries', DeliveryOrderViewSet)
router.register(r'transfers', InternalTransferViewSet)
router.register(r'moves', StockMoveViewSet)
router.register(r'adjustments', InventoryAdjustmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/me/', UserProfileView.as_view(), name='auth_me'),
    path('auth/password-reset/request/', RequestPasswordResetOTPView.as_view(), name='auth_request_password_reset'),
    path('auth/password-reset/verify/', VerifyOTPAndResetPasswordView.as_view(), name='auth_verify_password_reset'),
    
    path('dashboard/', DashboardKPIView.as_view(), name='dashboard_kpis'),
]
