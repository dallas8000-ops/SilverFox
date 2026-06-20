from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Ensure default staff superuser admin/admin exists.'

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@silverfox.com', 'is_staff': True, 'is_superuser': True},
        )
        user.set_password('admin')
        user.is_staff = True
        user.is_superuser = True
        user.save()
        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f'{action} staff user admin / admin'))
