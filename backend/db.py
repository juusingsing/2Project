import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    "host": os.getenv("MYSQL_HOST", "192.168.0.1"),
    "port": int(os.getenv("MYSQL_PORT", "3307")),
    "user": os.getenv("MYSQL_USER", "project2"),
    "password": os.getenv("MYSQL_PASSWORD", "1111"),
    "database": os.getenv("MYSQL_DATABASE", "secondpj"),
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
}

def get_connection():
    return pymysql.connect(**db_config)