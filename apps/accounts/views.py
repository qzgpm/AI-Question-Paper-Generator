import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from .models import User

@ensure_csrf_cookie
def api_get_csrf_token(request):
    """View to set CSRF cookie."""
    return JsonResponse({"status": "CSRF cookie set"})

@csrf_exempt
def api_register(request):
    """Creates a new user account."""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get("email")
        name = data.get("name")
        password = data.get("password")
        role = data.get("role", "faculty")
        
        if not email or not password or not name:
            return JsonResponse({"error": "Required fields missing"}, status=400)
            
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already registered"}, status=400)
            
        user = User.objects.create_user(
            email=email,
            name=name,
            password=password,
            role=role
        )
        
        return JsonResponse({
            "status": "success",
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def api_login(request):
    """Authenticates a user and starts a session."""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
        
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                "status": "success",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role
                }
            })
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def api_logout(request):
    """Ends the user session."""
    logout(request)
    return JsonResponse({"status": "success", "message": "Logged out"})

def api_get_current_user(request):
    """Returns data for the currently authenticated user."""
    if request.user.is_authenticated:
        return JsonResponse({
            "is_authenticated": True,
            "user": {
                "id": request.user.id,
                "email": request.user.email,
                "name": request.user.name,
                "role": request.user.role
            }
        })
    return JsonResponse({"is_authenticated": False})
