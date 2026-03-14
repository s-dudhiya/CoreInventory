from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

def enforce_csrf(request):
    """
    Enforce CSRF validation for session-like authentication.
    """
    check = CSRFCheck()
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)

class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that looks for the JWT token in an HttpOnly cookie 
    named 'access_token' instead of requiring it to be in the Authorization header.
    """
    def authenticate(self, request):
        # We first look for the token in the cookies
        raw_token = request.COOKIES.get('access_token')

        # If token is not in cookies, fallback to standard header authentication
        if raw_token is None:
            return super().authenticate(request)
            
        validated_token = self.get_validated_token(raw_token)
        enforce_csrf(request)
        return self.get_user(validated_token), validated_token
