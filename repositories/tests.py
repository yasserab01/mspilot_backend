from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .models import Repository, Section
from .serializers import RepositorySerializer

class RepositoryModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.repository = Repository.objects.create(name="Main Repository")

    def test_string_representation(self):
        self.assertEqual(str(self.repository), "Main Repository")

class RepositorySerializerTest(TestCase):
    def setUp(self):
        self.repository = Repository.objects.create(name="Test Repository")
        self.serializer = RepositorySerializer(instance=self.repository)

    def test_contains_expected_fields(self):
        data = self.serializer.data
        self.assertEqual(set(data.keys()), set(['id', 'name', 'sections']))

class RepositoryViewSetTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.repository = Repository.objects.create(name="Sample Repository")
        self.section = Section.objects.create(name="Section 1")
        self.url = reverse('repository-list')

    def test_list_repositories(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_repository(self):
        data = {'name': 'New Repository', 'sections': [self.section.id]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_repository(self):
        detail_url = reverse('repository-detail', args=[self.repository.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_repository(self):
        detail_url = reverse('repository-detail', args=[self.repository.id])
        data = {'name': 'Updated Repository', 'sections': [self.section.id]}  # Ensure all required fields are included
        response = self.client.put(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=response.data)  # Include response data in assertion message for diagnostics


    def test_delete_repository(self):
        detail_url = reverse('repository-detail', args=[self.repository.id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_update_sections(self):
        action_url = reverse('repository-update-sections', args=[self.repository.id])
        data = {'sections': [self.section.id]}
        response = self.client.post(action_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Sections updated successfully')

# Additional tests can be added here as needed
