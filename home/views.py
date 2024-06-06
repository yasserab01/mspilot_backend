from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import redirect
from django.urls import reverse


class HomeUserView(APIView):
    """
    API view to handle the home page requests.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # This would return some data relevant to the 'home' if necessary,
        # for now, it returns a simple message, or you can redirect as well.
        return Response({'message': 'Welcome to the home page!', 'currentTemplate': 'home'})


class HomeEmptyLinkView(APIView):
    """
    API view to redirect to the 'home' URL. In REST APIs, direct redirects are less common,
    and you would typically send a URL to the client to handle the redirect.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # In a RESTful API, instead of redirecting server-side, you might want to send back a URL to the client
        # Let's assume 'home' is the name of the URL pattern for the HomeUserView
        home_url = reverse('home')  # Make sure 'home' is defined in your urls.py
        return Response({'redirect_url': home_url}, status=status.HTTP_302_FOUND)

# Ensure your urls.py has the appropriate URL named 'home' that these views refer to.
