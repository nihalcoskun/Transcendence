import base64
import json
from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from pong.models import Stats

import jw"t
import datetime
from datetime import timezone
import os

import requests


def env(key):
    value = os.environ.get(key)
    if value is None:
        raise Exception(f"Missing environment variable: {key}")
    return value


def get_user(token):
    url = "https://api.intra.42.fr/v2/me"

    request = requests.get(url, headers={
        "Authorization": f"Bearer {token}"
    })

    data = request.json()

    if not request.ok:
        raise Exception(data)

    return data


def get_token(code):
    url = "https://api.intra.42.fr/oauth/token"

    payload = {
        "grant_type": "authorization_code",
        "client_id": env("AUTH_CID"),
        "client_secret": env("AUTH_SECRET"),
        "code": code,
        "redirect_uri": env("WEBSITE_URL") + "/login"
    }

    response = requests.post(url, data=payload)

    data = response.json()

    if not response.ok:
        raise Exception(data)

    return data["access_token"]


def logout(request):
    # Redirect to / with a cookie to delete
    return HttpResponse(status=302, headers={
        "Location": env("WEBSITE_URL"),
        "Set-Cookie": "token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
    })


def login(request):
    if (request.method != "GET"):
        return HttpResponse(status=405)

    code = request.GET.get("code", None)

    if code is None:
        return JsonResponse({"error": "Missing code"}, status=400)

    token = get_token(code)

    user = get_user(token)

    # Expire in 1 day
    expiration = datetime.datetime.now(
        tz=timezone.utc) + datetime.timedelta(days=1)

    token_payload = {
        "sub": user["login"],
        "exp": expiration,
        "name": user["displayname"],
    }

    user_data = {
        "username": user["login"],
        "name": user["displayname"],
        "image": user["image"]["link"]
    }

    user_data_bytes = json.dumps(user_data).encode("utf-8")
    user_data_bytes = base64.b64encode(user_data_bytes).decode("utf-8")

    # Generate new token
    token = jwt.encode(token_payload,
                       os.environ.get("JWT_SECRET"))

    redirect = env("WEBSITE_URL") + "?user=" + user_data_bytes

    # redirect
    return HttpResponse(status=302, headers={
        "Location": redirect,
        "Set-Cookie": f"token={token}; HttpOnly; Secure; SameSite=Strict"
    })


def stats(request):
    # Requires a token
    if request.token is None:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    username = request.token["sub"]

    if request.method == "GET":
        data = list(Stats.objects.filter(user=username).values(
            'players', 'winning_player', 'isTournamet', 'user'))

        return JsonResponse(data, safe=False)
    elif request.method == "POST":
        body = request.body.decode('utf-8')
        body = json.loads(body)

        stat = Stats()
        stat.players = body['players']
        stat.winning_player = body['winning_player']
        stat.isTournamet = body['isTournamet']
        stat.user = username
        stat.save()

        return JsonResponse({"status": "ok"})
    else:
        return HttpResponse(status=405)
