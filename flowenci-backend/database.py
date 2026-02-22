"""
Supabase Client setup.
Uses the official supabase-py SDK.
"""
from supabase import create_client, Client
from config import get_settings

settings = get_settings()

# Initialize the single Supabase client instance
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

def get_db() -> Client:
    """FastAPI dependency: yields the Supabase client."""
    # The Supabase client is thread-safe and can be yielded directly
    yield supabase
