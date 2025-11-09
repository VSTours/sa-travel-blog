from typing import Dict, Optional
from enum import Enum
from urllib.parse import urlencode

class AffiliateProvider(Enum):
    BOOKING = "booking"
    GETYOURGUIDE = "getyourguide"
    VIATOR = "viator"

class AffiliateService:
    def __init__(self):
        # Affiliate IDs
        self.affiliate_ids = {
            AffiliateProvider.BOOKING: "7777439",
            AffiliateProvider.GETYOURGUIDE: "OYSNX2E",
            AffiliateProvider.VIATOR: "P00275646"
        }
        
        # Base URLs for each provider
        self.base_urls = {
            AffiliateProvider.BOOKING: "https://www.booking.com/index.html",
            AffiliateProvider.GETYOURGUIDE: "https://www.getyourguide.com",
            AffiliateProvider.VIATOR: "https://www.viator.com"
        }
    
    def generate_booking_link(self, destination: Optional[str] = None) -> str:
        """Generate a Booking.com affiliate link."""
        params = {
            "aid": self.affiliate_ids[AffiliateProvider.BOOKING]
        }
        if destination:
            params["city"] = destination
            
        return f"{self.base_urls[AffiliateProvider.BOOKING]}?{urlencode(params)}"
    
    def generate_getyourguide_link(self, activity_id: Optional[str] = None) -> str:
        """Generate a GetYourGuide affiliate link."""
        partner_id = self.affiliate_ids[AffiliateProvider.GETYOURGUIDE]
        base = f"{self.base_urls[AffiliateProvider.GETYOURGUIDE]}/?partner_id={partner_id}"
        
        if activity_id:
            return f"{base}&activity_id={activity_id}"
        return base
    
    def generate_viator_link(self, tour_id: Optional[str] = None) -> str:
        """Generate a Viator affiliate link."""
        partner_id = self.affiliate_ids[AffiliateProvider.VIATOR]
        base = f"{self.base_urls[AffiliateProvider.VIATOR]}/?pid={partner_id}"
        
        if tour_id:
            return f"{base}&tour_id={tour_id}"
        return base
    
    def get_tracking_code(self, provider: AffiliateProvider) -> str:
        """Get the tracking code for a specific provider."""
        return self.affiliate_ids[provider]
    
    def get_all_tracking_codes(self) -> Dict[str, str]:
        """Get all affiliate tracking codes."""
        return {provider.value: self.affiliate_ids[provider] for provider in AffiliateProvider}
