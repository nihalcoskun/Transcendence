import jwt
import os
from django.http import JsonResponse


def get_token(request):
    token_str = request.COOKIES.get("token")

    if token_str is None:
        return None

    secret = os.environ.get("JWT_SECRET")

    token = jwt.decode(token_str, secret, algorithms=["HS256"])

    return token


def auth(get_response):

    def middleware(request):

        try:
            token = get_token(request)
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)
        except:
            return JsonResponse({"error": "Unknown token error"}, status=401)

        request.token = token

        response = get_response(request)

        return response

    return middleware
