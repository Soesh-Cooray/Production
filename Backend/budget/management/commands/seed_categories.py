from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from budget.models import Category

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds default categories for users who do not have them'

    def handle(self, *args, **options):
        users = User.objects.all()
        
        default_categories = {
            'income': ['Salary', 'Freelance', 'Investments', 'Other'],
            'expense': ['Food', 'Transport', 'Utilities', 'Rent', 'Entertainment', 'Health', 'Shopping', 'Other'],
            'savings': ['Emergency Fund', 'Retirement', 'Vacation', 'Home', 'Car', 'Other']
        }

        for user in users:
            if not Category.objects.filter(user=user).exists():
                self.stdout.write(f'Seeding categories for user: {user.username}')
                
                for cat_type, names in default_categories.items():
                    for name in names:
                        Category.objects.create(
                            name=name,
                            transaction_type=cat_type,
                            user=user,
                            is_default=True
                        )
                self.stdout.write(self.style.SUCCESS(f'Successfully seeded categories for {user.username}'))
            else:
                self.stdout.write(f'User {user.username} already has categories. Skipping.')
