from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIClient


from .models import Profile

class UserViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.admin_user = User.objects.create_superuser(username='admin', password='admin')
        self.client.force_authenticate(user=self.admin_user)
        self.url = reverse('user-list')

    def test_setup(self):
        # Test that users are created
        self.assertEqual(User.objects.count(), 2)
        self.assertEqual(User.objects.filter(username='testuser').exists(), True)
        self.assertEqual(User.objects.filter(username='admin').exists(), True)
        
        # Test that admin user is logged in
        response = self.client.get(self.url)
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)   

    def test_create_user(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post(self.url, data)
        if response.status_code != status.HTTP_201_CREATED:
            print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)


    def test_delete_user(self):
        # Create a new user for testing deletion
        user_to_delete = User.objects.create_user(username='usertodelete', password='password')
        user_to_delete_pk = user_to_delete.pk

        # Make sure the new user has a profile
        Profile.objects.get_or_create(user=user_to_delete)

        # Delete the new user
        response = self.client.delete(reverse('user-detail', kwargs={'pk': user_to_delete_pk}))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Check that the user and their profile were deleted
        self.assertFalse(User.objects.filter(pk=user_to_delete_pk).exists())


    def test_current_user(self):
        response = self.client.get(reverse('user-current'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'admin')
