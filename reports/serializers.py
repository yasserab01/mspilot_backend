from rest_framework import serializers
from .models import SubsectionStatus, Report


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'


class SubsectionStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubsectionStatus
        fields = '__all__'
