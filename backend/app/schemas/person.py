from pydantic import BaseModel


class PersonOut(BaseModel):
    id: int
    old_id: str | None = None
    name: str
    generation: int | None = None
    branch: str | None = None
    gender: str | None = None
    birth_year: str | None = None
    death_year: str | None = None
    is_alive: bool = True
    spouse: str | None = None
    bio: str | None = None
    father_id: int | None = None

    model_config = {"from_attributes": True}


class TreeNode(BaseModel):
    id: int
    old_id: str | None = None
    name: str
    generation: int | None = None
    branch: str | None = None
    gender: str | None = None
    birth_year: str | None = None
    death_year: str | None = None
    is_alive: bool = True
    spouse: str | None = None
    bio: str | None = None
    children: list["TreeNode"] = []

    model_config = {"from_attributes": True}


class StatsOut(BaseModel):
    total: int
    generations: int
    branches: int
    alive: int
