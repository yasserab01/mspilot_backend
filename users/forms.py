from django import forms
from .models import Profile

class PictureUploadForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['picture']