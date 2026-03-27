from decimal import Decimal

from rest_framework import serializers
from django.db.models import Sum
from .models import Budget, Category, Transaction
from .models import SavingsGoal


# Serializer for the Category model
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'transaction_type']

# Serializer for the Budget model
class BudgetSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'user', 'category', 'category_id', 'amount', 'period', 'start_date', 'created_at']
        read_only_fields = ['id', 'user', 'created_at', 'category']


# Serializer for the Transaction model
class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'user', 'category', 'category_name', 'amount', 'description', 'date', 'transaction_type', 'created_at']
        read_only_fields = ['id', 'user', 'created_at', 'category_name']


class SavingsGoalSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)
    current_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            'id',
            'user',
            'title',
            'category',
            'category_id',
            'target_amount',
            'current_amount',
            'remaining_amount',
            'progress_percent',
            'start_date',
            'target_date',
            'notes',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'category',
            'current_amount',
            'remaining_amount',
            'progress_percent',
        ]

    def validate_category(self, value):
        request = self.context.get('request')
        if value.transaction_type != 'savings':
            raise serializers.ValidationError('Savings goals must use a savings category.')
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError('Category does not belong to the current user.')
        return value

    def get_current_amount(self, obj):
        total = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            transaction_type='savings',
            date__gte=obj.start_date,
        ).aggregate(total=Sum('amount'))['total']
        return total or Decimal('0.00')

    def get_remaining_amount(self, obj):
        current = self.get_current_amount(obj)
        remaining = obj.target_amount - current
        return remaining if remaining > 0 else Decimal('0.00')

    def get_progress_percent(self, obj):
        if not obj.target_amount:
            return Decimal('0.00')
        current = self.get_current_amount(obj)
        percent = (current / obj.target_amount) * Decimal('100')
        return percent if percent <= 100 else Decimal('100.00')
