from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

from django.db import models

class Employee(models.Model):

    POSITION_CHOICES = [
        ("GM", "Manager"),
        ("AGM", "AssistantGeneralManager"),
        ("BARTENDER", "Bartender"),
        ("WAITER", "Waiter"),
        ("SUPERVISOR", "Supervisor"),
        ("BARBACK", "BarBack")
    ]

    GENDER_CHOICES = [
        ("MALE", "Male"),
        ("FEMALE", "Female")
    ]

    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    gender = models.CharField(choices=GENDER_CHOICES, max_length=10)
    position = models.CharField(choices=POSITION_CHOICES, max_length=10)
    user_code = models.IntegerField(unique=True, validators=[MinValueValidator(1000), MaxValueValidator(9999)])
    email = models.EmailField()
    start_date = models.DateField(default=timezone.now)

    last_sign_in = models.DateTimeField(null=True,blank=True)
    last_sign_out = models.DateTimeField(null=True,blank=True)
    isOnBreak = models.BooleanField(default=False)
    isOnShift = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Name: {self.first_name} {self.last_name}\nPosition: {self.position}\nStart Date: {self.start_date}\nEmail: {self.email}\nEmployee Code: {self.user_code}"
    

class Snapshot(models.Model):
    ACTION_CHOICES = [
        ("START_SHIFT", "Start my shift"),
        ("FINISH_SHIFT", "Finish my shift"),
        ("START_BREAK", "Start my break"),
        ("FINISH_BREAK", "Finish my break")
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='snapshots')
    timestamp = models.DateTimeField()
    action = models.CharField(choices = ACTION_CHOICES)
    photo = models.ImageField(upload_to="snapshots/")

    def __str__(self):
        return f"{self.employee.first_name} {self.employee.last_name} - {self.action} at {self.timestamp}"
    


class WeeklySummary(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='weekly_summaries')
    week_start = models.DateField()  # Monday of that week
    week_end = models.DateField()    # Sunday of that week
    total_hours = models.DecimalField(max_digits=5, decimal_places=2)
    generated_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'week_start')