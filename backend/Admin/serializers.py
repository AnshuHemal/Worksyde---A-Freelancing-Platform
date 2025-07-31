from rest_framework import serializers
from Auth.models import Requests, User, Skill, Education, WorkExperience, Category, Speciality


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'school', 'degree', 'fieldOfStudy',
            'startYear', 'endYear', 'description'
        ]


class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = [
            'id', 'title', 'company', 'city', 'country',
            'startDate', 'endDate', 'description'
        ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class SpecialitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Speciality
        fields = ['id', 'name']


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role']


class RequestSerializer(serializers.ModelSerializer):
    userId = UserSummarySerializer()
    skills = SkillSerializer(many=True)
    education = EducationSerializer(many=True)
    workExperience = WorkExperienceSerializer(many=True)
    categoryId = CategorySerializer()
    specialities = SpecialitySerializer(many=True)

    class Meta:
        model = Requests
        fields = [
            'id', 'userId', 'title', 'photograph', 'status', 'reviewedAt',
            'reviewFeedback', 'skills', 'education', 'workExperience',
            'categoryId', 'specialities', 'dob', 'streetAddress', 'city',
            'state', 'postalCode', 'country', 'phone', 'bio', 'hourlyRate', 'languages'
        ]
