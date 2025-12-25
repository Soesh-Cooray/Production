from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from .models import Budget, Category, Transaction
from .serializers import BudgetSerializer, CategorySerializer, TransactionSerializer
from rest_framework.permissions import IsAuthenticated

from rest_framework.decorators import action
from django.db import transaction
from django.core.cache import cache


# ViewSet for managing categories (expense, income, savings) for the authenticated user
class CategoryViewSet(viewsets.ModelViewSet):
    def perform_update(self, serializer):
        with transaction.atomic():
            serializer.save(user=self.request.user)
            # Invalidate cache when category updated
            cache.delete(f'user_categories_{self.request.user.id}')
            
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Cache categories for 10 minutes to reduce DB queries
        cache_key = f'user_categories_{self.request.user.id}'
        categories = cache.get(cache_key)
        
        if categories is None:
            categories = list(Category.objects.filter(user=self.request.user))
            cache.set(cache_key, categories, 600)  # 10 minutes
        
        # Return QuerySet for DRF compatibility
        if isinstance(categories, list):
            return Category.objects.filter(user=self.request.user)
        return categories

    def perform_create(self, serializer):
        with transaction.atomic():
            serializer.save(user=self.request.user)
            # Invalidate cache when new category created
            cache.delete(f'user_categories_{self.request.user.id}')

# Action to retrieve all expense,income and savings categories for the authenticated user
    @action(detail=False, methods=['get'])
    def expense_categories(self, request):
        qs = Category.objects.filter(user=request.user, transaction_type='expense')
        serializer = CategorySerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def income_categories(self, request):
        qs = Category.objects.filter(user=request.user, transaction_type='income')
        serializer = CategorySerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def savings_categories(self, request):
        qs = Category.objects.filter(user=request.user, transaction_type='savings')
        serializer = CategorySerializer(qs, many=True)
        return Response(serializer.data)


# ViewSet for managing budgets for the authenticated user
class BudgetViewSet(viewsets.ModelViewSet):
    def perform_update(self, serializer):
        with transaction.atomic():
            serializer.save(user=self.request.user)
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        with transaction.atomic():
            serializer.save(user=self.request.user)


# ViewSet for managing transactions (expenses, incomes, savings) for the authenticated user
class TransactionViewSet(viewsets.ModelViewSet):
    def perform_update(self, serializer):
        with transaction.atomic():
            serializer.save(user=self.request.user)
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Use select_related to avoid N+1 queries
        return Transaction.objects.filter(user=self.request.user).select_related('category', 'user')

    def perform_create(self, serializer):
        with transaction.atomic():
            serializer.save(user=self.request.user)

# Actions to retrieve transactions by type (expenses, incomes, savings) with date filtering
    @action(detail=False, methods=['get'])
    def expenses(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        # get_queryset() already has select_related
        qs = self.get_queryset().filter(transaction_type='expense')
        if start_date and end_date:
            qs = qs.filter(date__range=[start_date, end_date])
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def incomes(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        # get_queryset() already has select_related
        qs = self.get_queryset().filter(transaction_type='income')
        if start_date and end_date:
            qs = qs.filter(date__range=[start_date, end_date])
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def savings(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        # get_queryset() already has select_related
        qs = self.get_queryset().filter(transaction_type='savings')
        if start_date and end_date:
            qs = qs.filter(date__range=[start_date, end_date])
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)