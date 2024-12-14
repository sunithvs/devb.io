import json
import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Central configuration management"""
    GITHUB_API_TOKEN = os.getenv("API_TOKEN_GITHUB")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    # Paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
    HTML_OUTPUT_DIR = os.path.join(BASE_DIR, 'docs')
    DATA_TO_PROCESS = os.path.join(DATA_DIR, 'users.json')
    PROCESSED_USERS_DIR = os.path.join(BASE_DIR, 'docs/data')
    PROCESSED_USERS_FILE = os.path.join(PROCESSED_USERS_DIR, 'processed_users.json')
    LOGS_DIR = os.path.join(BASE_DIR, 'logs')
    TEMPLATE_FILES = [file for file in os.listdir(TEMPLATES_DIR) if file.endswith('.html')]
    if 'index.html' in TEMPLATE_FILES:
        TEMPLATE_FILES.remove('index.html')
    # Generation settings
    MAX_USERS_PER_RUN = 10
    CONTRIBUTION_DAYS = 120
    with open(os.path.join(DATA_DIR, 'blacklist.json'), 'r') as f:
        BLACKLISTED_USERS = json.load(f)

    BLACKLISTED_USERS = {user.lower() for user in BLACKLISTED_USERS}
    REDIS_HOST = "redis://redis:6379/0"
    API_URL = "https://user.devb.io"


if __name__ == "__main__":
    Settings()
