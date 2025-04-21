from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mssql+pyodbc://serg:Roosky98@localhost:1433/Scaffold?driver=SQL+Server+Native+Client+11.0&Encrypt=yes&TrustServerCertificate=yes"
engine = create_engine(DATABASE_URL, connect_args={"verify": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()