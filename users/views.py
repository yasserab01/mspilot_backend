from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Profile
from .serializers import UserSerializer, ProfileSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        print(f"Request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'status': 'success', 'message': 'Account created successfully!'},
                            status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        user = self.get_object()
        if request.user == user or request.user.is_staff:
            user.delete()
            return Response({'status': 'success', 'message': 'Account deleted successfully'},
                            status=status.HTTP_204_NO_CONTENT)
        return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk=None):
        user = self.get_object()
        if user != request.user and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        new_password = request.data.get('new_password')
        old_password = request.data.get('old_password')
        if user.check_password(old_password):
            user.set_password(new_password)
            user.save()
            return Response({'status': 'success', 'message': 'Password updated successfully'})
        return Response({'status': 'error', 'message': 'Incorrect password'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='upload-picture', url_name='user-upload-picture')
    def upload_picture(self, request, pk=None):
        user = self.get_object()
        if user != request.user and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        if 'picture' not in request.FILES:
            return Response({'status': 'error', 'message': 'No picture provided'}, status=status.HTTP_400_BAD_REQUEST)

        profile = user.profile
        profile.picture = request.FILES['picture']
        profile.save()
        return Response({'status': 'success', 'imageUrl': profile.picture.url})

    def update(self, request, pk=None, partial=False):
        user = self.get_object()
        if user != request.user and not request.user.is_staff:
            return Response({'status': 'error', 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        profile, created = Profile.objects.get_or_create(user=user)

        user_serializer = UserSerializer(user, data=request.data, partial=partial)
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=partial)

        user_valid = user_serializer.is_valid()
        profile_valid = profile_serializer.is_valid()

        if user_valid and profile_valid:
            user_serializer.save()
            profile_serializer.save()
            return Response({'status': 'success', 'message': 'User updated successfully'})
        else:
            errors = {}
            if not user_valid:
                errors.update(user_serializer.errors)
                print(f"User serializer errors: {user_serializer.errors}")  # Log user serializer errors
            if not profile_valid:
                errors.update(profile_serializer.errors)
                print(f"Profile serializer errors: {profile_serializer.errors}")  # Log profile serializer errors
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='current', url_name='current')
    def current_user(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
