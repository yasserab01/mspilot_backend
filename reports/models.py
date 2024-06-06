from django.db import models
from companies.models import Company
from repositories.models import Repository
from sections.models import Subsection

class Report(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.company.name} - {self.repository.name} Report"

class SubsectionStatus(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    subsection = models.ForeignKey(Subsection, on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    justification = models.TextField()

    def __str__(self):
        return f"{self.report.company.name} - {self.report.repository.name} - {self.subsection.name} Subsection Status"
