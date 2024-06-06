from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .models import Section, Subsection

class SectionModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.section = Section.objects.create(id="001", name="Main Section")

    def test_string_representation(self):
        self.assertEqual(str(self.section), "Main Section")

class SubsectionModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.section = Section.objects.create(id="002", name="Main Section")
        cls.subsection = Subsection.objects.create(section=cls.section, name="Subsection 1", description="Description of Subsection 1")

    def test_string_representation(self):
        self.assertEqual(str(self.subsection), f"Subsection 1 - {self.section}")

class SectionViewSetTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.section = Section.objects.create(id="003", name="Sample Section")
        self.subsection = Subsection.objects.create(section=self.section, name="Sample Subsection", description="Sample Description")
        self.url = reverse('section-list')

    def test_create_section_with_subsections(self):
        data = {
            'id': '004',
            'name': 'New Section',
            'subsections': [
                {'name': 'New Subsection', 'description': 'New Description'}
            ]
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, msg=response.data)
        self.assertEqual(Section.objects.count(), 2)
        self.assertEqual(Subsection.objects.count(), 2)

    def test_retrieve_section(self):
        detail_url = reverse('section-detail', args=[self.section.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_section_with_subsections(self):
        detail_url = reverse('section-update_subsections', args=[self.section.id])
        data = {'name': 'Updated Section', 'subsections': [{'name': 'Updated Subsection', 'description': 'Updated Description'}]}
        response = self.client.put(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Subsection.objects.filter(section=self.section).count(), 1)

    def test_delete_section(self):
        detail_url = reverse('section-detail', args=[self.section.id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Section.objects.count(), 0)
        self.assertEqual(Subsection.objects.count(), 0)

    def test_get_subsections(self):
        action_url = reverse('section-subsections', args=[self.section.id])
        response = self.client.get(action_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_delete_subsections(self):
        action_url = reverse('section-delete_subsections', args=[self.section.id])
        response = self.client.delete(action_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Subsection.objects.filter(section=self.section).count(), 0)
