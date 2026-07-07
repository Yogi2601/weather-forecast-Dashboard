import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:@localhost/weather_dashboard"
)

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_TIMEOUT = int(os.getenv("GEMINI_TIMEOUT", "30"))  # seconds

# Validate that API key is configured
if not GEMINI_API_KEY:
    import warnings
    warnings.warn(
        "GEMINI_API_KEY environment variable is not set. "
        "AI features will not be available. "
        "Set GEMINI_API_KEY in your .env file to enable Gemini integration."
    )