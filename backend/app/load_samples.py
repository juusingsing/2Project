import pandas as pd
from sqlalchemy import create_engine
import os

# 프로젝트 루트 기준으로 data/sys_test.csv 경로 지정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # PROJECT2/
CSV_PATH = os.path.join(BASE_DIR, "data", "sys_test.csv")

# CSV 읽기
df = pd.read_csv(CSV_PATH)

# 컬럼명 매핑
df = df.rename(columns={
    "Class": "gas_type_id",
    "Concentration": "concentration"
})

# MySQL 연결 (session.py 설정 그대로 맞추세요)
engine = create_engine(
    "mysql+pymysql://project2:1111@127.0.0.1:3307/secondpj"
)

# DB에 적재
df.to_sql("samples_wide", con=engine, if_exists="append", index=False)

print("✅ CSV 데이터를 samples_wide 테이블에 적재 완료!")
