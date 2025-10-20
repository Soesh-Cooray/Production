from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import BudgetViewSet, CategoryViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('transactions/expenses/', TransactionViewSet.as_view({'get': 'expenses'}), name='transaction-expenses'),
    path('transactions/income/', TransactionViewSet.as_view({'get': 'incomes'}), name='transaction-incomes'),
    path('transactions/savings/', TransactionViewSet.as_view({'get': 'savings'}), name='transaction-savings'),
    path('transactions/expense_categories/', TransactionViewSet.as_view({'get': 'expense_categories'}), name='transaction-expense-categories'),
    path('categories/expense_categories/', CategoryViewSet.as_view({'get': 'expense_categories'}), name='category-expense-categories'),
    path('categories/income_categories/', CategoryViewSet.as_view({'get': 'income_categories'}), name='category-income-categories'),
    path('categories/savings_categories/', CategoryViewSet.as_view({'get': 'savings_categories'}), name='category-savings-categories'),
    path('', include(router.urls)),
]
