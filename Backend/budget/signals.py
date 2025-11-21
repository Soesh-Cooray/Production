from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Category

User = get_user_model()

@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        default_categories = {
            'income': ['Salary', 'Freelance', 'Investments', 'Other'],
            'expense': ['Food', 'Transport', 'Utilities', 'Rent', 'Entertainment', 'Health', 'Shopping', 'Other'],
            'savings': ['Emergency Fund', 'Retirement', 'Vacation', 'Home', 'Car', 'Other']
        }

        for cat_type, names in default_categories.items():
            for name in names:
                Category.objects.create(
                    name=name,
                    transaction_type=cat_type,
                    user=instance,
                    is_default=True
                )
