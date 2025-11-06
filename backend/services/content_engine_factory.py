# ============================================================================
# FILE: backend/services/content_engine_factory.py
# ============================================================================
"""
Location: backend/services/content_engine_factory.py
Purpose: Factory to create content engines based on AI provider
"""

import os
from typing import Dict

class ContentEngineFactory:
    """Factory to create content engines based on AI provider"""
    
    @staticmethod
    def create_content_engine(provider: str = None):
        """Create content engine based on provider or environment variable"""
        
        # Get provider from parameter or environment
        if not provider:
            provider = os.getenv("AI_PROVIDER", "gemini").lower()
        
        try:
            if provider == "gemini":
                from .content_engine_gemini import ContentEngine
                return ContentEngine()
            elif provider == "anthropic":
                from .content_engine_anthropic import ContentEngine
                return ContentEngine()
            elif provider == "openai":
                from .content_engine_openai import ContentEngine  
                return ContentEngine()
            else:
                raise ValueError(f"Unsupported AI provider: {provider}. Supported: gemini, anthropic, openai")
        except ImportError as e:
            raise ValueError(f"AI provider '{provider}' dependencies not installed. Run: pip install -r requirements.txt")
        except Exception as e:
            raise ValueError(f"Failed to initialize AI provider '{provider}': {str(e)}")

    @staticmethod
    def get_available_providers() -> Dict[str, Dict]:
        """Get information about available AI providers"""
        return {
            "gemini": {
                "name": "Google Gemini",
                "description": "Google's powerful AI model with free tier",
                "env_var": "GEMINI_API_KEY",
                "signup_url": "https://ai.google.dev",
                "free_tier": "60 requests/minute",
                "recommended": True
            },
            "anthropic": {
                "name": "Anthropic Claude",
                "description": "Advanced AI with excellent reasoning capabilities",
                "env_var": "ANTHROPIC_API_KEY", 
                "signup_url": "https://console.anthropic.com",
                "free_tier": "$5 credits",
                "recommended": False
            },
            "openai": {
                "name": "OpenAI GPT-4",
                "description": "Popular AI model with strong performance",
                "env_var": "OPENAI_API_KEY",
                "signup_url": "https://platform.openai.com",
                "free_tier": "Pay per use",
                "recommended": False
            }
        }

    @staticmethod
    def validate_provider_setup(provider: str) -> Dict[str, any]:
        """Validate if a provider is properly configured"""
        providers = ContentEngineFactory.get_available_providers()
        
        if provider not in providers:
            return {
                "valid": False,
                "error": f"Unknown provider: {provider}"
            }
        
        provider_info = providers[provider]
        env_var = provider_info["env_var"]
        api_key = os.getenv(env_var)
        
        if not api_key:
            return {
                "valid": False,
                "error": f"Missing API key: {env_var} not set in environment",
                "setup_url": provider_info["signup_url"]
            }
        
        try:
            # Try to create the engine (will validate API key format/connection)
            engine = ContentEngineFactory.create_content_engine(provider)
            return {
                "valid": True,
                "provider": provider,
                "message": f"{provider_info['name']} is properly configured"
            }
        except Exception as e:
            return {
                "valid": False,
                "error": f"Configuration error: {str(e)}",
                "setup_url": provider_info["signup_url"]
            }