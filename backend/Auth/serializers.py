from rest_framework import serializers
from .models import Education, Requests, WorkExperience, Skill, Speciality, Category, JobPosts, JobProposals


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'


class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = '__all__'


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class SpecialitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Speciality
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class RequestProfileSerializer(serializers.ModelSerializer):
    workExperience = WorkExperienceSerializer(many=True)
    education = EducationSerializer(many=True)
    skills = SkillSerializer(many=True)
    specialities = SpecialitySerializer(many=True)
    categoryId = CategorySerializer()

    class Meta:
        model = Requests
        fields = '__all__'

class JobPostSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    hourlyRateFrom = serializers.DecimalField(max_digits=10, decimal_places=2)
    hourlyRateTo = serializers.DecimalField(max_digits=10, decimal_places=2)
    scopeOfWork = serializers.CharField()
    duration = serializers.CharField()
    experienceLevel = serializers.CharField()
    isContractToHire = serializers.CharField()
    postedTime = serializers.DateTimeField(allow_null=True)
    attachments = serializers.CharField(allow_blank=True)
    applicants = serializers.IntegerField()
    createdAt = serializers.DateTimeField()
    updatedAt = serializers.DateTimeField()
    
    # If these are references:
    userId = serializers.CharField(source='userId.id', required=False)
    categoryId = serializers.CharField(source='categoryId.id', required=False)
    
    # For nested skill references
    skills = serializers.SerializerMethodField()

    def get_skills(self, obj):
        return [{"id": str(skill.id), "name": skill.name} for skill in obj.skills if skill] 
        
class JobProposalSerializer(serializers.Serializer):
    id = serializers.CharField()
    jobId = JobPostSerializer()
    userId = serializers.CharField(source='userId.id')
    projectScope = serializers.CharField()
    bidAmount = serializers.DecimalField(max_digits=10, decimal_places=2)
    serviceFee = serializers.DecimalField(max_digits=10, decimal_places=2)
    youReceive = serializers.DecimalField(max_digits=10, decimal_places=2)
    projectDuration = serializers.CharField()
    coverLetter = serializers.CharField()
    attachment = serializers.CharField(allow_null=True)
    milestones = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField()
    updatedAt = serializers.DateTimeField()

    def get_milestones(self, obj):
        # Convert EmbeddedDocumentList to list of dicts
        result = []
        for m in obj.milestones:
            result.append({
                'title': m.title,
                'dueDate': m.dueDate.isoformat() if m.dueDate else None,
                'amount': float(m.amount) if m.amount is not None else None
            })
        return result