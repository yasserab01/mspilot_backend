# Generated by Django 5.0.3 on 2024-06-12 15:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0004_auto_20240521_1522'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subsection',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='subsection',
            name='section',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subsections', to='sections.section'),
        ),
    ]
