from django.contrib import admin

# Register your models here.

from .models import Section, Subsection

admin.site.register(Section)

admin.site.register(Subsection)
