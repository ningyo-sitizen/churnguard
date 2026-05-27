import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST_CHURNGUARD"),
    "user": os.getenv("DB_USER_CHURNGUARD"),
    "password": os.getenv("DB_PASS_CHURNGUARD"),
    "database": os.getenv("DB_DATABASE_CHURNGUARD"),
    "port": os.getenv("DB_PORT"),
}