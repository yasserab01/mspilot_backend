from django.db import models
from sections.models import Section

class Repository(models.Model):
    name = models.CharField(max_length=100)
    sections = models.ManyToManyField(Section)

    def __str__(self):
        return self.name
