from django.contrib import admin
from .models import Employee, Snapshot, WeeklySummary

admin.site.register(Employee)
admin.site.register(Snapshot)

@admin.register(WeeklySummary)
class WeeklySummaryAdmin(admin.ModelAdmin):
    list_display = ('employee', 'week_start', 'week_end', 'total_hours', 'generated_on')
    list_filter = ('week_start', 'employee__position')
    search_fields = ('employee__first_name', 'employee__last_name')

