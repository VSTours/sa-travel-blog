#!/usr/bin/env python3
"""
Test script for AI provider factory
Run: python test_ai_providers.py
"""

import os
import sys
# Add backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

try:
    from services.content_engine_factory import ContentEngineFactory
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure you're running from the VSCode deployment directory")
    sys.exit(1)

def test_providers():
    """Test available AI providers"""
    
    print("🧪 Testing AI Provider Factory\n")
    
    # Test getting available providers
    providers = ContentEngineFactory.get_available_providers()
    print("📋 Available Providers:")
    for provider_id, info in providers.items():
        print(f"  {provider_id}: {info['name']} - {info['description']}")
        print(f"    Free tier: {info['free_tier']}")
        print(f"    Recommended: {'✅' if info['recommended'] else '❌'}")
        print()
    
    # Test factory creation (will fail without API keys, but that's expected)
    print("🏭 Testing Factory Creation:")
    
    test_providers = ['gemini', 'anthropic', 'openai']
    
    for provider in test_providers:
        try:
            engine = ContentEngineFactory.create_content_engine(provider)
            print(f"✅ {provider}: Factory creation successful")
        except ValueError as e:
            if "API_KEY not set" in str(e):
                print(f"⚠️  {provider}: Expected error - API key not set (this is normal)")
            else:
                print(f"❌ {provider}: Unexpected error - {e}")
        except Exception as e:
            print(f"❌ {provider}: Error - {e}")
    
    print("\n✅ AI Provider Factory test completed!")

if __name__ == "__main__":
    test_providers()