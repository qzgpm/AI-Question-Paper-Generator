import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import User

@ensure_csrf_cookie
def api_get_csrf_token(request):
    """View to set CSRF cookie."""
    return JsonResponse({"status": "CSRF cookie set"})

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

def api_update_profile(request):
    """Updates the current user's name and/or email."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    try:
        data = json.loads(request.body)
        user = request.user
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()

        if not name or not email:
            return JsonResponse({"error": "Name and email are required"}, status=400)

        if email != user.email and User.objects.filter(email=email).exclude(pk=user.pk).exists():
            return JsonResponse({"error": "Email already in use"}, status=400)

        user.name = name
        user.email = email
        user.save(update_fields=["name", "email"])
        return JsonResponse({
            "status": "success",
            "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def api_change_password(request):
    """Changes the current user's password after verifying the current one."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    try:
        data = json.loads(request.body)
        current_password = data.get("current_password", "")
        new_password = data.get("new_password", "")

        if not current_password or not new_password:
            return JsonResponse({"error": "Both current and new password are required"}, status=400)
        if len(new_password) < 8:
            return JsonResponse({"error": "New password must be at least 8 characters"}, status=400)

        user = authenticate(request, username=request.user.email, password=current_password)
        if user is None:
            return JsonResponse({"error": "Current password is incorrect"}, status=401)

        user.set_password(new_password)
        user.save()
        # Re-login to refresh session after password change
        login(request, user)
        return JsonResponse({"status": "success", "message": "Password changed successfully"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
