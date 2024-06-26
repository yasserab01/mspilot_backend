from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from django.contrib.auth.hashers import make_password

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['picture']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'profile']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},  # Make password not required
            'username': {'required': False}  # Make username not required
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        validated_data['email'] = validated_data.get('email', '').lower()
        validated_data['password'] = make_password(validated_data.get('password', ''))
        user = User.objects.create(**validated_data)
        if profile_data:
            Profile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        profile = instance.profile

        instance.email = validated_data.get('email', instance.email).lower()
        instance.username = validated_data.get('username', instance.username)

        if 'password' in validated_data:
            instance.password = make_password(validated_data.get('password'))

        instance.save()

        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance
