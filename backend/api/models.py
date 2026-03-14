from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver
import random
import string

# -----------------------------
# USER PROFILE (ROLES)
# -----------------------------
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('inventory_manager', 'Inventory Manager'),
        ('warehouse_staff', 'Warehouse Staff'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='warehouse_staff')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# -----------------------------
# CATEGORY
# -----------------------------
class Category(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# -----------------------------
# UNIT OF MEASURE
# -----------------------------
class UnitOfMeasure(models.Model):
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.name} ({self.symbol})"


# -----------------------------
# WAREHOUSE
# -----------------------------
class Warehouse(models.Model):
    name = models.CharField(max_length=150)
    address = models.TextField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

@receiver(post_save, sender=Warehouse)
def create_default_location(sender, instance, created, **kwargs):
    if created:
        Location.objects.get_or_create(warehouse=instance, name="Main")


# -----------------------------
# LOCATION / RACK
# -----------------------------
class Location(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)

    def __str__(self):
        return f"{self.warehouse.name} - {self.name}"


# -----------------------------
# PRODUCT
# -----------------------------
class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    unit = models.ForeignKey(UnitOfMeasure, on_delete=models.SET_NULL, null=True)
    initial_stock = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.sku})"


# -----------------------------
# STOCK PER LOCATION
# -----------------------------
class Stock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)

    class Meta:
        unique_together = ('product', 'location')

    def __str__(self):
        return f"{self.product.name} - {self.location.name} ({self.quantity})"


# -----------------------------
# SUPPLIER
# -----------------------------
class Supplier(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.name


# -----------------------------
# RECEIPTS (INCOMING GOODS)
# -----------------------------
class Receipt(models.Model):

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('waiting', 'Waiting'),
        ('ready', 'Ready'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
    ]

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt {self.id}"


class ReceiptItem(models.Model):
    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.product.name} ({self.quantity})"


# -----------------------------
# DELIVERY ORDERS (OUTGOING)
# -----------------------------
class DeliveryOrder(models.Model):

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('waiting', 'Waiting'),
        ('ready', 'Ready'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
    ]

    customer_name = models.CharField(max_length=200)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Delivery {self.id}"


class DeliveryItem(models.Model):
    delivery = models.ForeignKey(DeliveryOrder, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.product.name} ({self.quantity})"


# -----------------------------
# INTERNAL TRANSFER
# -----------------------------
class InternalTransfer(models.Model):

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('waiting', 'Waiting'),
        ('ready', 'Ready'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
    ]

    from_location = models.ForeignKey(Location, related_name="transfer_from", on_delete=models.CASCADE)
    to_location = models.ForeignKey(Location, related_name="transfer_to", on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transfer {self.id}"


class TransferItem(models.Model):
    transfer = models.ForeignKey(InternalTransfer, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.product.name} ({self.quantity})"


# -----------------------------
# INVENTORY ADJUSTMENT
# -----------------------------
class InventoryAdjustment(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    recorded_quantity = models.IntegerField()
    counted_quantity = models.IntegerField()
    reason = models.TextField(blank=True)
    adjusted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def difference(self):
        return self.counted_quantity - self.recorded_quantity

    def __str__(self):
        return f"Adjustment {self.product.name}"


# -----------------------------
# STOCK MOVEMENT / LEDGER
# -----------------------------
class StockMove(models.Model):

    MOVE_TYPES = [
        ('receipt', 'Receipt'),
        ('delivery', 'Delivery'),
        ('transfer', 'Transfer'),
        ('adjustment', 'Adjustment'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    quantity_change = models.IntegerField()
    move_type = models.CharField(max_length=20, choices=MOVE_TYPES)
    reference_id = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} ({self.quantity_change})"


# -----------------------------
# OTP STORAGE FOR PASSWORD RESET
# -----------------------------
class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # OTP is valid for 10 minutes
        return not self.is_used and self.created_at >= timezone.now() - timedelta(minutes=10)

    def __str__(self):
        return f"{self.user.username} - {self.code}"

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

class SystemSetting(models.Model):
    low_stock_threshold = models.IntegerField(default=50)
    auto_assign_location = models.BooleanField(default=True)
    enable_multi_warehouse_transfers = models.BooleanField(default=True)
    require_approval_for_adjustments = models.BooleanField(default=False)

    def __str__(self):
        return "System Settings"

    class Meta:
        verbose_name = "System Setting"
        verbose_name_plural = "System Settings"