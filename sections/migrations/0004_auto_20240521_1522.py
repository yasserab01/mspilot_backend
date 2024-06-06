# Generated by Django 3.1.7 on 2024-05-21 15:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0003_alter_section_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='section',
            name='id',
            field=models.CharField(max_length=100, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='subsection',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]