import os
import logging
from typing import Optional, Dict, TypedDict, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailConfig(TypedDict):
    smtp_server: str
    smtp_port: int
    smtp_email: str
    smtp_password: str

class EmailContent(TypedDict):
    subject: str
    body_html: str
    body_text: Optional[str]

class EmailService:
    def __init__(self):
        load_dotenv()
        self.config = self._load_config()
        self._validate_config()

    def _load_config(self) -> EmailConfig:
        """Load email configuration from environment variables."""
        return {
            'smtp_server': os.getenv('SMTP_SERVER', 'smtp.zoho.com'),
            'smtp_port': int(os.getenv('SMTP_PORT', '587')),
            'smtp_email': os.getenv('SMTP_EMAIL', ''),
            'smtp_password': os.getenv('SMTP_PASSWORD', '')
        }

    def _validate_config(self) -> None:
        """Validate that all required configuration is present."""
        required_fields = ['smtp_email', 'smtp_password']
        missing_fields = [field for field in required_fields if not self.config[field]]
        if missing_fields:
            raise ValueError(f"Missing required email configuration: {', '.join(missing_fields)}")

    def send_email(self, to_email: str, content: EmailContent) -> bool:
        """
        Send an email using the configured SMTP server.
        
        Args:
            to_email: The recipient's email address
            content: EmailContent containing subject and body
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = content['subject']
            msg['From'] = self.config['smtp_email']
            msg['To'] = to_email

            # Add HTML and plain text versions
            if content.get('body_text'):
                msg.attach(MIMEText(content['body_text'], 'plain'))
            msg.attach(MIMEText(content['body_html'], 'html'))

            with smtplib.SMTP(self.config['smtp_server'], self.config['smtp_port']) as server:
                server.starttls()
                server.login(self.config['smtp_email'], self.config['smtp_password'])
                server.send_message(msg)
                
            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_bulk_email(self, to_emails: List[str], content: EmailContent) -> Dict[str, bool]:
        """
        Send emails to multiple recipients.
        
        Args:
            to_emails: List of recipient email addresses
            content: EmailContent containing subject and body
            
        Returns:
            Dict[str, bool]: Map of email addresses to success/failure status
        """
        results = {}
        for email in to_emails:
            results[email] = self.send_email(email, content)
        return results

    def test_connection(self) -> bool:
        """Test the email connection configuration."""
        try:
            with smtplib.SMTP(self.config['smtp_server'], self.config['smtp_port']) as server:
                server.starttls()
                server.login(self.config['smtp_email'], self.config['smtp_password'])
            logger.info("Email connection test successful")
            return True
        except Exception as e:
            logger.error(f"Email connection test failed: {str(e)}")
            return False

# Example usage:
if __name__ == "__main__":
    # Initialize the email service
    email_service = EmailService()
    
    # Test configuration
    if email_service.test_connection():
        # Send a test email
        test_content = EmailContent(
            subject="Test Email",
            body_html="<h1>Test Email</h1><p>This is a test email from the travel blog system.</p>",
            body_text="Test Email\n\nThis is a test email from the travel blog system."
        )
        
        result = email_service.send_email(
            to_email=os.getenv('SMTP_EMAIL', ''),  # Send to self for testing
            content=test_content
        )
        
        print(f"Test email sent: {'Success' if result else 'Failed'}")
    else:
        print("Failed to connect to email server")
