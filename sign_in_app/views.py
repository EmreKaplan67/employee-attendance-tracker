from django.shortcuts import render
from django.urls import reverse
from django.core.files.storage import default_storage
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from .models import Employee, Snapshot
from rest_framework import serializers
import json

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["first_name", "last_name", "user_code"]


@csrf_exempt
def index(request):
    if request.method == 'POST':
        try:
            photo = request.FILES.get('snapshot')
            action = request.POST.get('action')
            safe_action = action.replace(" ", "_").upper()
            user_code = request.POST.get('userCode')

            if not user_code or not action or not photo:
                return JsonResponse({'error': 'user code, action, or snapshot required'})

            try: 
                employee = Employee.objects.get(user_code = user_code)
            except Employee.DoesNotExist:
                return JsonResponse({'error': 'Employee not found'}, status=404)
            

            # get the last snapshot (if any)
            last_action = employee.snapshots.order_by('-timestamp').first()

            if safe_action == "START_SHIFT":
                if employee.isOnShift:
                    return JsonResponse({'error': 'Already on a shift.'}, status=400)
                
            elif safe_action == "FINISH_SHIFT":
                if employee.isOnBreak:
                    return JsonResponse({'error': 'Finish your break before ending your shift.'}, status=400)
                if not employee.isOnShift:
                    return JsonResponse({'error': 'Not currently on a shift.'}, status=400)
        
            elif safe_action == "START_BREAK":
                if not employee.isOnShift:
                    return JsonResponse({'error': 'Must start a shift before taking a break.'}, status=400)
                if employee.isOnBreak:
                    return JsonResponse({'error': 'Already on a break.'}, status=400)
            
            elif safe_action == "FINISH_BREAK":
                if not employee.isOnBreak:
                    return JsonResponse({'error': 'Not currently on a break.'}, status=400)
        
            else:
                return JsonResponse({'error': 'Invalid action type.'}, status=400)
        
            now = timezone.now()
        
            # Passed the validation, create the snapshot
            snapshot = Snapshot.objects.create(
                employee = employee,
                action = safe_action,
                timestamp = now,
                photo = photo
            )

            # Update Employee Status
            if safe_action == "START_SHIFT":
                employee.isOnShift = True
                employee.last_sign_in = snapshot.timestamp
            elif safe_action == "FINISH_SHIFT":
                employee.isOnShift = False
                employee.last_sign_out = snapshot.timestamp
            elif safe_action == "START_BREAK":
                employee.isOnBreak = True
            elif safe_action == "FINISH_BREAK":
                employee.isOnBreak = False

            employee.save()

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
        
        return JsonResponse({'redirect': reverse('index')})

    
    return render(request, "sign_in_app/index.html")
    
    
        
        
        