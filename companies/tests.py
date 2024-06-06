from django.test import TestCase
from .models import Company
from .serializers import CompanySerializer
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Company
from .serializers import CompanySerializer
from django.contrib.auth.models import User
from rest_framework.test import APIClient

class CompanyModelTest(TestCase):
    def test_string_representation(self):
        company = Company(name="OpenAI")
        self.assertEqual(str(company), "OpenAI")

class CompanySerializerTest(TestCase):
    def setUp(self):
        self.company_attributes = {'name': 'OpenAI'}
        self.company = Company.objects.create(**self.company_attributes)
        self.serializer = CompanySerializer(instance=self.company)

    def test_contains_expected_fields(self):
        data = self.serializer.data
        self.assertEqual(set(data.keys()), set(['id', 'name']))

    def test_name_field_content(self):
        data = self.serializer.data
        self.assertEqual(data['name'], self.company_attributes['name'])

    def test_create_company(self):
        data = {'name': 'New Company'}
        serializer = CompanySerializer(data=data)
        if serializer.is_valid():
            company = serializer.save()
            self.assertEqual(company.name, 'New Company')

class CompanyViewSetTest(APITestCase):
    def setUp(self):
        # Create a user for authentication
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client = APIClient()  # Ensure to use DRF's APIClient
        self.client.force_authenticate(user=self.user)  # Force authentication of the user

        # Create sample companies
        Company.objects.create(name='OpenAI')
        Company.objects.create(name='Tesla')

    def test_list_companies(self):
        """
        Ensure we can retrieve a list of companies.
        """
        response = self.client.get(reverse('company-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # We expect two companies in the database

    def test_create_company(self):
        """
        Ensure we can create a new company.
        """
        response = self.client.post(reverse('company-list'), {'name': 'New Company'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Company created successfully!')
        self.assertEqual(Company.objects.count(), 3)  # Including the newly created company

    def test_retrieve_company(self):
        """
        Ensure we can retrieve a single company by ID.
        """
        company = Company.objects.get(name='OpenAI')
        response = self.client.get(reverse('company-detail', args=[company.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'OpenAI')

    def test_unauthorized_access(self):
        """
        Ensure that unauthorized access returns a 401 Unauthorized.
        """
        self.client.force_authenticate(user=None)  # Remove authentication
        response = self.client.get(reverse('company-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)