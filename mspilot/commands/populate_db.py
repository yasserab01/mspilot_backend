from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from companies.models import Company
from users.models import Profile
from sections.models import Section, Subsection
from repositories.models import Repository
from reports.models import Report, SubsectionStatus
from faker import Faker

fake = Faker()


class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **kwargs):
        # Create Users and Profiles
        for i in range(10):
            user = User.objects.create_user(username=f'user{i}', password='password')
            #Profile.objects.create(user=user, picture=None)

        # Create Companies
        companies = []
        for i in range(10):
            company = Company.objects.create(name=fake.company())
            companies.append(company)

        # Create Sections and Subsections
        sections = []
        for i in range(10):
            section = Section.objects.create(id=f'section{i}', name=f'Section {i}')
            sections.append(section)
            for j in range(5):
                Subsection.objects.create(section=section, name=f'Subsection {j} of Section {i}',
                                          description=fake.text())

        # Create Repositories
        repositories = []
        for i in range(5):
            repository = Repository.objects.create(name=f'Repository {i}')
            repository.sections.set(sections)
            repositories.append(repository)

        # Create Reports
        reports = []
        for company in companies:
            for repository in repositories:
                report = Report.objects.create(company=company, repository=repository)
                reports.append(report)

        # Create SubsectionStatuses
        for report in reports:
            for section in sections:
                for subsection in section.subsections.all():
                    SubsectionStatus.objects.create(
                        report=report,
                        subsection=subsection,
                        status=fake.random_element(elements=('Applicable', 'Non-Applicable')),
                        justification=fake.text()
                    )

        self.stdout.write(self.style.SUCCESS('Successfully populated the database'))
