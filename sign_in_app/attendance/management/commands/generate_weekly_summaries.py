from django.core.management.base import BaseCommand
from django.utils.timezone import now
from datetime import timedelta
from sign_in_app.utils import calculate_weekly_hours
from sign_in_app.models import WeeklySummary

class Command(BaseCommand):
    help = "Calculates and stores weekly hours for all employees"

    def handle(self, *args, **kwargs):
        today = now().date()
        start_of_week = today - timedelta(days=today.weekday())  # Monday
        end_of_week = start_of_week + timedelta(days=6)          # Sunday

        summaries = calculate_weekly_hours(start_of_week, end_of_week)

        for employee, duration in summaries.items():
            hours = round(duration.total_seconds() / 3600, 2)

            WeeklySummary.objects.update_or_create(
                employee=employee,
                week_start=start_of_week,
                defaults={
                    'week_end': end_of_week,
                    'total_hours': hours
                }
            )

        self.stdout.write(self.style.SUCCESS("Weekly summaries generated and saved."))


##########  python manage.py generate_weekly_summaries   ###############
""" Run this command whenever you wanna create some weekly summaries

Keyword arguments:
Celery -- install this to automate the process

Or simply use task scheduler on your windows machine to run the script automatically
"""

