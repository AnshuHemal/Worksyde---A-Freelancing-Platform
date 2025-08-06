from mongoengine import (
    Document,
    StringField,
    EmailField,
    BooleanField,
    DateTimeField,
    DictField,
    ReferenceField,
    ListField,
    IntField,
    DecimalField,
    BinaryField,
    MapField,
    EmbeddedDocument,
    EmbeddedDocumentField,
    fields
)
from django.utils import timezone


class User(Document):
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    name = StringField(required=True)
    phone = StringField() 
    phoneVerified = BooleanField(default=False)
    isverified = BooleanField(default=False)
    lastLogin = DateTimeField(default=timezone.now)
    role = StringField(required=True)
    freelanceSurveyAnswers = MapField(field=StringField(), default={})
    onlineStatus = StringField(choices=["online", "offline"], default="offline")
    lastSeen = DateTimeField(default=timezone.now)
    aiPreference = StringField(choices=["yes", "no", "depends"], default="depends")

    meta = {"collection": "users", "strict": False}


class PaymentCard(Document):
    userId = ReferenceField(User, required=True)
    cardType = StringField(required=True, choices=["visa", "mastercard", "rupay", "amex"])
    cardNumber = StringField(required=True, max_length=19)  # Encrypted in practice
    cardholderName = StringField(required=True)
    expiryMonth = StringField(required=True, max_length=2)
    expiryYear = StringField(required=True, max_length=4)
    cvv = StringField(required=True, max_length=4)  # Encrypted in practice
    isDefault = BooleanField(default=False)
    isActive = BooleanField(default=True)
    createdAt = DateTimeField(default=timezone.now)
    updatedAt = DateTimeField(default=timezone.now)
    
    # Billing Address
    billingAddress = StringField()
    billingCity = StringField()
    billingState = StringField()
    billingPostalCode = StringField()
    billingCountry = StringField()
    
    # Card metadata
    lastFourDigits = StringField(max_length=4)
    cardBrand = StringField()
    
    meta = {
        "collection": "paymentcards",
        "indexes": ["userId", "isDefault", "isActive"],
        "ordering": ["-createdAt"]
    }
    
    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = timezone.now()
        self.updatedAt = timezone.now()
        
        # Extract last 4 digits for display
        if self.cardNumber and len(self.cardNumber) >= 4:
            self.lastFourDigits = self.cardNumber[-4:]
        
        # Set card brand based on card number
        if self.cardNumber:
            if self.cardNumber.startswith('4'):
                self.cardBrand = 'visa'
            elif self.cardNumber.startswith('5'):
                self.cardBrand = 'mastercard'
            elif self.cardNumber.startswith('6'):
                self.cardBrand = 'rupay'
            elif self.cardNumber.startswith('3'):
                self.cardBrand = 'amex'
        
        return super().save(*args, **kwargs)


class Otp(Document):
    email = EmailField(required=True)
    code = StringField(required=True, max_length=6)
    createdAt = DateTimeField(default=timezone.now)

    meta = {
        "collection": "otps",
        "indexes": ["createdAt"],
    }


class PhoneOtp(Document):
    phone_number = StringField(required=True)
    code = StringField(required=True, max_length=6)
    createdAt = DateTimeField(default=timezone.now)
    expiresAt = DateTimeField(default=timezone.now)  # OTP expiration time - made optional for backward compatibility

    meta = {
        "collection": "phone_otps",
        "indexes": ["createdAt"],
    }


class Category(Document):
    name = StringField(required=True, unique=True)

    meta = {"collection": "categories"}


class Speciality(Document):
    name = StringField(required=True)
    categoryId = ReferenceField(Category, required=True)

    meta = {"collection": "specialities", "strict": False}


class Skill(Document):
    name = StringField(required=True, unique=True)

    meta = {"collection": "skills", "strict": False}


class Resume(Document):
    userId = ReferenceField(User, required=True)
    fileName = StringField()
    contentType = StringField()
    data = BinaryField()

    meta = {"collection": "resumes"}


class JobAttachment(Document):
    jobId = ReferenceField("JobPosts", required=True)
    fileName = StringField()
    contentType = StringField()
    data = BinaryField()

    meta = {"collection": "jobattachments"}


class WorkExperience(Document):
    userId = ReferenceField("User")
    title = StringField()
    company = StringField()
    city = StringField()
    country = StringField()
    startDate = DateTimeField()
    endDate = DateTimeField(null=True)
    description = StringField()

    meta = {"collection": "workexperiences"}


class Education(Document):
    userId = ReferenceField("User")
    school = StringField()
    degree = StringField()
    fieldOfStudy = StringField()
    startYear = IntField()
    endYear = IntField()
    description = StringField()

    meta = {"collection": "educations"}


class OtherExperience(Document):
    userId = ReferenceField("User")
    subject = StringField()
    description = StringField()
    createdAt = DateTimeField(default=timezone.now)
    updatedAt = DateTimeField(default=timezone.now)

    meta = {"collection": "otherexperiences"}


class Language(EmbeddedDocument):
    name = StringField()
    proficiency = StringField()


class Requests(Document):
    userId = ReferenceField(User, required=True)
    title = StringField()
    resume = StringField()
    workExperience = ListField(ReferenceField(WorkExperience))
    education = ListField(ReferenceField(Education))
    otherExperiences = ListField(ReferenceField(OtherExperience))
    languages = ListField(EmbeddedDocumentField(Language))
    skills = ListField(ReferenceField(Skill))
    categoryId = ReferenceField(Category)
    specialities = ListField(ReferenceField(Speciality))
    bio = StringField()
    hourlyRate = DecimalField(precision=2)
    dob = DateTimeField()
    phone = StringField()
    streetAddress = StringField()
    city = StringField()
    state = StringField()
    postalCode = StringField()
    country = StringField()
    photograph = StringField()
    videoIntro = StringField()  # New field for video introduction
    status = StringField(
        choices=["draft", "under_review", "approved", "rejected"], default="draft"
    )
    submittedAt = DateTimeField()
    reviewedAt = DateTimeField()
    reviewFeedback = StringField()
    
    # Profile Settings Fields
    visibility = StringField(
        choices=["public", "private"], 
        default="public"
    )
    projectPreference = StringField(
        choices=["short_term_project", "long_term_project", "both"], 
        default="both"
    )
    experienceLevel = StringField(
        choices=["entry", "intermediate", "expert"], 
        default="entry"
    )
    aiPreference = StringField(
        choices=["yes", "no", "depends"], 
        default="yes"
    )

    meta = {"collection": "requests"}


class Company(Document):
    """Company model for storing client company information"""
    userId = ReferenceField(User, required=True)
    companyName = StringField(required=True)
    website = StringField()
    industry = StringField()
    size = StringField()
    tagline = StringField()
    description = StringField()
    logo = StringField()  # URL to company logo
    createdAt = DateTimeField(default=timezone.now)
    updatedAt = DateTimeField(default=timezone.now)

    meta = {
        "collection": "companies",
        "indexes": ["userId"],
        "ordering": ["-updatedAt"]
    }

    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = timezone.now()
        self.updatedAt = timezone.now()
        return super().save(*args, **kwargs)


class JobPosts(Document):
    userId = ReferenceField("User", required=True)
    title = StringField()
    skills = ListField(ReferenceField("Skill"))
    categoryId = ReferenceField("Category")
    description = StringField()
    status = StringField(choices=["draft", "verified", "not_verified"], default="draft")
    hourlyRateFrom = DecimalField(precision=2)
    hourlyRateTo = DecimalField(precision=2)
    scopeOfWork = StringField()
    duration = StringField()
    experienceLevel = StringField()
    isContractToHire = StringField(
        choices=["Yes, this is a contract-to-hire opportunity", "No, not at this time"],
        default="No, not at this time",
    )
    postedTime = DateTimeField()
    attachments = StringField()
    applicants = IntField(default=0)
    createdAt = DateTimeField()
    updatedAt = DateTimeField()

    meta = {"collection": "jobposts", "strict": False}


class Milestone(EmbeddedDocument):
    title = StringField()
    dueDate = DateTimeField()
    amount = DecimalField(precision=2)


class JobProposals(Document):
    jobId = ReferenceField(JobPosts, required=True)
    userId = ReferenceField(User, required=True)
    projectScope = StringField()
    bidAmount = DecimalField(precision=2)
    serviceFee = DecimalField(precision=2)
    youReceive = DecimalField(precision=2)
    projectDuration = StringField()
    coverLetter = StringField()
    attachment = StringField(default=None)
    milestones = ListField(EmbeddedDocumentField(Milestone))
    createdAt = DateTimeField(default=timezone.now)
    updatedAt = DateTimeField(default=timezone.now)

    meta = {"collection": "jobproposals", "strict": False}


class ProposalAttachment(Document):
    data = BinaryField()
    contentType = StringField()
    proposalId = ReferenceField(JobProposals)

    meta = {"collection": "proposalattachments"}


# Resume Builder Models
class Template(EmbeddedDocument):
    theme = fields.StringField()
    colorPalette = fields.ListField(fields.StringField())

class ProfileInfo(EmbeddedDocument):
    profilePreviewUrl = fields.StringField()
    fullName = fields.StringField()
    designation = fields.StringField()
    summary = fields.StringField()

class ContactInfo(EmbeddedDocument):
    email = fields.StringField()
    phone = fields.StringField()
    location = fields.StringField()
    linkedin = fields.StringField()
    github = fields.StringField()
    website = fields.StringField()

class ResumeWorkExperience(EmbeddedDocument):
    company = fields.StringField()
    role = fields.StringField()
    startDate = fields.StringField()
    endDate = fields.StringField()
    description = fields.StringField()

class ResumeEducation(EmbeddedDocument):
    degree = fields.StringField()
    institution = fields.StringField()
    startDate = fields.StringField()
    endDate = fields.StringField()

class ResumeSkill(EmbeddedDocument):
    name = fields.StringField()
    progress = fields.IntField()

class Project(EmbeddedDocument):
    title = fields.StringField()
    description = fields.StringField()
    github = fields.StringField()
    liveDemo = fields.StringField()

class Certification(EmbeddedDocument):
    title = fields.StringField()
    issuer = fields.StringField()
    year = fields.StringField()

class ResumeLanguage(EmbeddedDocument):
    name = fields.StringField()
    progress = fields.IntField()

class ResumeBuilder(Document):
    userId = fields.ReferenceField('User', required=True)
    title = fields.StringField(required=True)
    thumbnailLink = fields.StringField()
    template = fields.EmbeddedDocumentField(Template)
    profileInfo = fields.EmbeddedDocumentField(ProfileInfo)
    contactInfo = fields.EmbeddedDocumentField(ContactInfo)
    workExperience = fields.EmbeddedDocumentListField(ResumeWorkExperience)
    education = fields.EmbeddedDocumentListField(ResumeEducation)
    skills = fields.EmbeddedDocumentListField(ResumeSkill)
    projects = fields.EmbeddedDocumentListField(Project)
    certifications = fields.EmbeddedDocumentListField(Certification)
    languages = fields.EmbeddedDocumentListField(ResumeLanguage)
    interests = fields.ListField(fields.StringField())
    createdAt = fields.DateTimeField(default=timezone.now)
    updatedAt = fields.DateTimeField(default=timezone.now)

    meta = {
        'collection': 'resume',
        'ordering': ['-createdAt'],
        'indexes': ['userId', 'title'],
        'auto_create_index': True,
    }

    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = timezone.now()
        self.updatedAt = timezone.now()
        return super().save(*args, **kwargs)


class PayPalAccount(Document):
    userId = ReferenceField(User, required=True)
    paypalEmail = EmailField(required=True)
    paypalAccountId = StringField()  # PayPal account ID
    isActive = BooleanField(default=True)
    isDefault = BooleanField(default=False)
    createdAt = DateTimeField(default=timezone.now)
    updatedAt = DateTimeField(default=timezone.now)
    
    meta = {
        "collection": "paypalaccounts",
        "indexes": ["userId", "isActive", "isDefault"],
        "ordering": ["-createdAt"]
    }
    
    def save(self, *args, **kwargs):
        if not self.createdAt:
            self.createdAt = timezone.now()
        self.updatedAt = timezone.now()
        return super().save(*args, **kwargs)
