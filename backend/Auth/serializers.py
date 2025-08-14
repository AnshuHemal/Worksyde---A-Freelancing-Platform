from rest_framework import serializers
from .models import Education, Requests, WorkExperience, Skill, Speciality, Category, JobPosts, JobProposals, Company, JobInvitation


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


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
    budgetType = serializers.CharField()
    hourlyRateFrom = serializers.DecimalField(max_digits=10, decimal_places=2)
    hourlyRateTo = serializers.DecimalField(max_digits=10, decimal_places=2)
    fixedRate = serializers.DecimalField(max_digits=10, decimal_places=2)
    scopeOfWork = serializers.CharField()
    ws_token = serializers.IntegerField()
    duration = serializers.CharField()
    experienceLevel = serializers.CharField()
    isContractToHire = serializers.CharField()
    postedTime = serializers.DateTimeField(allow_null=True)
    attachments = serializers.CharField(allow_blank=True)
    applicants = serializers.IntegerField()
    createdAt = serializers.DateTimeField()
    updatedAt = serializers.DateTimeField()
    invites = serializers.IntegerField()  # <-- Added field
    createdAt = serializers.DateTimeField()
    updatedAt = serializers.DateTimeField()
    # If these are references:
    userId = serializers.CharField(source='userId.id', required=False)
    categoryId = serializers.CharField(source='categoryId.id', required=False)
    # For nested skill references
    skills = serializers.SerializerMethodField()
    # For category information
    category = serializers.SerializerMethodField()

    def get_skills(self, obj):
        return [{"id": str(skill.id), "name": skill.name} for skill in obj.skills if skill]
    
    def get_category(self, obj):
        if obj.categoryId:
            return {"id": str(obj.categoryId.id), "name": obj.categoryId.name}
        return None 
        
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

class JobInvitationSerializer(serializers.Serializer):
    id = serializers.CharField()
    jobId = serializers.CharField(source='jobId.id')
    clientId = serializers.CharField(source='clientId.id')
    freelancerId = serializers.CharField(source='freelancerId.id')
    message = serializers.CharField()
    createdAt = serializers.DateTimeField()
    jobTitle = serializers.SerializerMethodField()
    jobDescription = serializers.SerializerMethodField()
    clientHires = serializers.SerializerMethodField()
    clientSpent = serializers.SerializerMethodField()
    jobSkills = serializers.SerializerMethodField()
    jobHourlyFrom = serializers.SerializerMethodField()
    jobHourlyTo = serializers.SerializerMethodField()
    jobBudgetType = serializers.SerializerMethodField()
    jobFixedRate = serializers.SerializerMethodField()
    jobExperienceLevel = serializers.SerializerMethodField()
    jobDuration = serializers.SerializerMethodField()
    jobCategory = serializers.SerializerMethodField()
    jobPostedTime = serializers.SerializerMethodField()
    jobScope = serializers.SerializerMethodField()

    def get_jobTitle(self, obj):
        return getattr(obj.jobId, 'title', None)
    def get_jobDescription(self, obj):
        return getattr(obj.jobId, 'description', None)
    def get_clientHires(self, obj):
        from Auth.models import JobPosts, JobProposals
        client_id = getattr(obj.clientId, 'id', None)
        if not client_id:
            return 0
        job_ids = JobPosts.objects(userId=client_id).only('id')
        proposals = JobProposals.objects(jobId__in=job_ids, status='completed')
        unique_freelancers = set(str(p.userId.id) for p in proposals if hasattr(p, 'userId'))
        return len(unique_freelancers)
    def get_clientSpent(self, obj):
        from Auth.models import JobPosts, JobProposals
        client_id = getattr(obj.clientId, 'id', None)
        if not client_id:
            return 0
        job_ids = JobPosts.objects(userId=client_id).only('id')
        proposals = JobProposals.objects(jobId__in=job_ids, status='completed')
        total_spent = sum(float(p.youReceive or 0) for p in proposals)
        return total_spent

    def get_jobSkills(self, obj):
        if hasattr(obj.jobId, 'skills'):
            return [getattr(skill, 'name', str(skill)) for skill in getattr(obj.jobId, 'skills', [])]
        return []
    def get_jobHourlyFrom(self, obj):
        return str(getattr(obj.jobId, 'hourlyRateFrom', ''))
    def get_jobHourlyTo(self, obj):
        return str(getattr(obj.jobId, 'hourlyRateTo', ''))
    def get_jobBudgetType(self, obj):
        return getattr(obj.jobId, 'budgetType', 'fixed')
    def get_jobFixedRate(self, obj):
        return str(getattr(obj.jobId, 'fixedRate', ''))
    def get_jobExperienceLevel(self, obj):
        return getattr(obj.jobId, 'experienceLevel', None)
    def get_jobDuration(self, obj):
        return getattr(obj.jobId, 'duration', None)
    def get_jobCategory(self, obj):
        return getattr(obj.jobId.categoryId, 'name', None) if hasattr(obj.jobId, 'categoryId') and obj.jobId.categoryId else None
    def get_jobPostedTime(self, obj):
        return getattr(obj.jobId, 'createdAt', None)
    def get_jobScope(self, obj):
        return getattr(obj.jobId, 'scopeOfWork', None)