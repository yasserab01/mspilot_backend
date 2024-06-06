# Generated by Django 5.0.3 on 2024-03-27 10:02

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('companies', '0001_initial'),
        ('repositories', '0001_initial'),
        ('sections', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=50)),
                ('justification', models.TextField()),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='companies.company')),
                ('repository', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repositories.repository')),
                ('sections', models.ManyToManyField(to='sections.section')),
                ('subsections', models.ManyToManyField(to='sections.subsection')),
            ],
        ),
    ]