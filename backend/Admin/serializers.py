from rest_framework import serializers
from Auth.models import Requests, User, Skill, Education, WorkExperience, Category, Speciality


class SkillSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()


class EducationSerializer(serializers.Serializer):
    id = serializers.CharField()
    school = serializers.CharField()
    degree = serializers.CharField()
    fieldOfStudy = serializers.CharField()
    startYear = serializers.CharField()
    endYear = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)


class WorkExperienceSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    company = serializers.CharField()
    city = serializers.CharField()
    country = serializers.CharField()
    startDate = serializers.DateTimeField()
    endDate = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)


class CategorySerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()


class SpecialitySerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()


class LanguageSerializer(serializers.Serializer):
    name = serializers.CharField()
    proficiency = serializers.CharField()


class UserSummarySerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    email = serializers.CharField()
    role = serializers.CharField()


class RequestSerializer(serializers.Serializer):
    id = serializers.CharField()
    _id = serializers.CharField(source='id')  # Add _id field for compatibility
    userId = UserSummarySerializer()
    title = serializers.CharField(required=False, allow_blank=True)
    photograph = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField()
    reviewedAt = serializers.DateTimeField(required=False)
    reviewFeedback = serializers.CharField(required=False, allow_blank=True)
    skills = SkillSerializer(many=True, required=False)
    education = EducationSerializer(many=True, required=False)
    workExperience = WorkExperienceSerializer(many=True, required=False)
    categoryId = CategorySerializer(required=False)
    specialities = SpecialitySerializer(many=True, required=False)
    dob = serializers.DateTimeField(required=False)
    streetAddress = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    postalCode = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    hourlyRate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    languages = LanguageSerializer(many=True, required=False)
    resume = serializers.CharField(required=False, allow_blank=True)
