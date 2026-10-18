import random

from pydantic import BaseModel

from .config import MODEL_CONFIG

_FIRST_NAMES = [
    "James",
    "Mary",
    "Robert",
    "Patricia",
    "John",
    "Jennifer",
    "Michael",
    "Linda",
    "David",
    "Elizabeth",
    "William",
    "Barbara",
    "Richard",
    "Susan",
    "Joseph",
    "Jessica",
]
_LAST_NAMES = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
]


def random_real_name() -> str:
    return f"{random.choice(_FIRST_NAMES)} {random.choice(_LAST_NAMES)}"


class GoodModel(BaseModel):
    model_config = MODEL_CONFIG
    Id: int = 1
    Name: str

    @classmethod
    def from_id(cls, id: int) -> "GoodModel":
        resolved = id
        if resolved == 1:
            resolved = random.randint(1001, 9999)
        return cls(Id=resolved, Name=random_real_name())
