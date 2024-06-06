from django.contrib import admin

# Register your models here.

from .models import Repository

admin.site.register(Repository)
