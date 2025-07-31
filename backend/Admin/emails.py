from django.core.mail import EmailMessage
from django.conf import settings


def send_freelancer_applicant_review_email(user_email, review_msg):
    subject = "Your Application is being Reviewed !!"
    body = f"<h3>{review_msg}</h3>"

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=f'Worksyde <{settings.EMAIL_HOST_USER}>',
        to=[user_email],
    )
    email.content_subtype = "html"

    try:
        email.send(fail_silently=False)
        print("Review email sent successfully")
    except Exception as e:
        print("Error sending review email:", e)


def send_otp_email(to_email, otp_code):
    subject = "Verify your email - Worksyde"
    body = f"<h3>Your OTP code is: <b>{otp_code}</b></h3><p>This code will expire in 5 minutes.</p>"

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=f'Worksyde <{settings.EMAIL_HOST_USER}>',
        to=[to_email],
    )
    email.content_subtype = "html"

    try:
        email.send(fail_silently=False)
        print("OTP email sent successfully")
    except Exception as e:
        print("Error sending OTP email:", e)


def send_under_review_email(user_email):
    subject = "Your Application is Under Review"
    body = "<h3>Dear User,</h3><p>Your application is now under review. We'll get back to you soon.</p>"

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=f'Worksyde <{settings.EMAIL_HOST_USER}>',
        to=[user_email],
    )
    email.content_subtype = "html"

    try:
        email.send(fail_silently=False)
        print("Under review email sent successfully")
    except Exception as e:
        print("Error sending under review email:", e)

def send_client_verify_email_job_post(user_email, user_fullname, job_id):
    subject = "Verify your email address, to get started on Worksyde"

    verification_link = f"http://localhost:5000/api/auth/verify-email/jobpost/{job_id}?email={user_email}"

    body = f"""
        <h3>Verify your email address to complete your registration</h3>
        <p>Hi {user_fullname}, <br/>
        Welcome to Worksyde!<br/><br/>
        Please verify your email address so you can get full access to qualified freelancers eager to tackle your project.<br/><br/>
        We're thrilled to have you on board!</p>
        <a href="{verification_link}" style="padding: 10px 20px; background-color: #007674; color: white; text-decoration: none;">Verify Email</a>
    """

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=f"Worksyde <{settings.EMAIL_HOST_USER}>",
        to=[user_email],
    )
    email.content_subtype = "html"

    try:
        email.send(fail_silently=False)
        print("Client verification email sent successfully")
    except Exception as e:
        print("Error sending verification email to client:", e)