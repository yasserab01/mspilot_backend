# Generated by Django 5.0.3 on 2024-03-27 12:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0001_initial'),
        ('sections', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='report',
            name='justification',
        ),
        migrations.RemoveField(
            model_name='report',
            name='sections',
        ),
        migrations.RemoveField(
            model_name='report',
            name='status',
        ),
        migrations.RemoveField(
            model_name='report',
            name='subsections',
        ),
        migrations.CreateModel(
            name='SubsectionStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=50)),
                ('justification', models.TextField()),
                ('report', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reports.report')),
                ('subsection', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sections.subsection')),
            ],
        ),
    ]