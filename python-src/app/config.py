from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file=(".env.development"))

  tenant_id: str
  client_id: str
  api_scope: str
  id_provider: Optional[str] = None
  # jwks_url = f"{authority}/discovery/v2.0/keys"

  db_server: str = "127.0.0.1:1433"
  db_name: str = "Scaff_DB"
  db_username: str = "user_scaffold"
  db_password: str = ""
  db_driver: str = "ODBC+Driver+17+for+SQL+Server"
  db_encrypt: str = "yes"
  db_trustservercertificate: str = "yes"

  # db_url = f"mssql+pyodbc://{db_username}:{db_username}@{db_server}/{db_name}?driver={db_driver}&Encrypt={db_encrypt}&TrustServerCertificate={db_trustservercertificate}"

  cors_origins: str
  open_paths: List[str] = ["/", "/about", "/api/settings"]

  @property
  def is_ms(self):
    if (
      self.id_provider == None 
      or self.id_provider == "" 
      or self.id_provider.lower().startswith("entra") 
      or self.id_provider.lower().startswith("azure")
      or self.id_provider.lower().startswith("microsoft")):
      return True
    return False

  @property
  def authority(self):
    return f"https://login.microsoftonline.com/{self.tenant_id}" if self.is_ms else self.tenant_id

  @property
  def api_audience(self):
    return self.client_id if self.is_ms else self.tenant_id
  
  @property
  def jwks_url(self):
    return f"{self.authority}/discovery/v2.0/keys" if self.is_ms else f"{self.authority}/oauth2/v1/keys"
  
  @property
  def db_url(self):
    return f"mssql+pyodbc://{self.db_username}:{self.db_password}@{self.db_server}/{self.db_name}?driver={self.db_driver}&Encrypt={self.db_encrypt}&TrustServerCertificate={self.db_trustservercertificate}"
    

@lru_cache
def get_settings():
  return Settings()

settings = get_settings()
