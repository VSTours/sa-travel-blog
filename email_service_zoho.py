
# ============================================================================
# FILE 4: backend/services/email_service_zoho.py
# ============================================================================
"""
Location: backend/services/email_service_zoho.py
Purpose: Email sending via Zoho SMTP
No additional installation needed (uses built-in smtplib)
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import List

class EmailService:
    """Email service using Zoho Mail SMTP"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.zoho.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.sender_email = os.getenv("SMTP_EMAIL")
        self.app_password = os.getenv("SMTP_PASSWORD")
        
        if not self.sender_email or not self.app_password:
            raise ValueError("SMTP_EMAIL and SMTP_PASSWORD must be set")
    
    def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """Send single email"""
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.sender_email
        msg['To'] = to_email
        msg.attach(MIMEText(html_body, 'html'))
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.app_password)
                server.send_message(msg)
            
            print(f"✅ Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending email to {to_email}: {str(e)}")
            return False
    
    def send_newsletter(self, subscriber_list: List[str], subject: str, html_body: str) -> Dict:
        """Send newsletter to multiple subscribers"""
        
        successful = 0
        failed = 0
        
        for email in subscriber_list:
            if self.send_email(email, subject, html_body):
                successful += 1
            else:
                failed += 1
        
        print(f"📊 Newsletter: {successful} sent, {failed} failed")
        return {"sent": successful, "failed": failed}
    
    def send_welcome_email(self, subscriber_email: str) -> bool:
        """Send welcome email to new subscriber"""
        
        html = """
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0066cc;">Welcome to Our Travel Blog!</h2>
                <p>Thank you for subscribing to our luxury travel content from South Africa.</p>
                <p>You'll receive:</p>
                <ul>
                    <li>Weekly articles about luxury travel experiences</li>
                    <li>Exclusive travel deals and recommendations</li>
                    <li>Insider tips and hidden gems</li>
                    <li>Special offers from our partners</li>
                </ul>
                <p><a href="https://yourblog.com" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Our Blog</a></p>
                <p>Best regards,<br>The Travel Blog Team</p>
            </body>
        </html>
        """
        
        return self.send_email(
            subscriber_email,
            "Welcome to Our Travel Blog!",
            html
        )
    
    def send_new_post_notification(self, subscriber_list: List[str], post_title: str, post_url: str) -> Dict:
        """Notify subscribers of new blog post"""
        
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0066cc;">🌍 New Blog Post Published!</h2>
                <h3>{post_title}</h3>
                <p>Check out our latest article about luxury travel in South Africa.</p>
                <p><a href="{post_url}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Read Now</a></p>
                <p>Best regards,<br>The Travel Blog Team</p>
            </body>
        </html>
        """
        
        return self.send_newsletter(
            subscriber_list,
            f"New Blog Post: {post_title}",
            html
        )


