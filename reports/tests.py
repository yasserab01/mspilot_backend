from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .models import Company, Repository, Report, Subsection, SubsectionStatus

class ReportModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.company = Company.objects.create(name='Test Company')
        cls.repository = Repository.objects.create(name='Test Repository')
        cls.report = Report.objects.create(company=cls.company, repository=cls.repository)

    def test_string_representation(self):
        self.assertEqual(str(self.report), f"{self.company.name} - {self.repository.name} Report")

class ReportViewSetTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.company = Company.objects.create(name='Sample Company')
        self.repository = Repository.objects.create(name='Sample Repository')
        self.report = Report.objects.create(company=self.company, repository=self.repository)
        self.url = reverse('report-list')

    def test_list_reports(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_report(self):
        data = {'company': self.company.id, 'repository': self.repository.id}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_report(self):
        detail_url = reverse('report-detail', args=[self.report.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_report(self):
        detail_url = reverse('report-detail', args=[self.report.id])
        data = {'company': self.company.id, 'repository': self.repository.id}
        response = self.client.put(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_report(self):
        detail_url = reverse('report-detail', args=[self.report.id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

class PDFReportTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.company = Company.objects.create(name='PDF Company')
        self.repository = Repository.objects.create(name='PDF Repository')
        self.report = Report.objects.create(company=self.company, repository=self.repository)
        self.pdf_url = reverse('pdf-report')

    def test_pdf_generation(self):
        data = {'report_id': self.report.id, 'filename': 'test_report.pdf'}
        response = self.client.post(self.pdf_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response['Content-Type'], 'application/pdf')
