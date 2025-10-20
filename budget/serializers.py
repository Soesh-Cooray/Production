from rest_framework import serializers
from .models import Budget, Category, Transaction


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
