from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.person import Person
from app.schemas.person import PersonOut, TreeNode, StatsOut

router = APIRouter(prefix="/api", tags=["族人"])


@router.get("/persons", response_model=list[PersonOut])
def list_persons(
    branch: str | None = Query(None, description="支系篩��"),
    generation: int | None = Query(None, description="世代篩選"),
    name: str | None = Query(None, description="姓名搜尋"),
    db: Session = Depends(get_db),
):
    q = db.query(Person)
    if branch:
        q = q.filter(Person.branch == branch)
    if generation is not None:
        q = q.filter(Person.generation == generation)
    if name:
        q = q.filter(Person.name.contains(name))
    return q.order_by(Person.generation, Person.id).all()


@router.get("/persons/{person_id}", response_model=PersonOut)
def get_person(person_id: int, db: Session = Depends(get_db)):
    person = db.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="找不到此族人")
    return person


@router.get("/tree", response_model=list[TreeNode])
def get_tree(db: Session = Depends(get_db)):
    """回傳巢狀樹結構，從根節點開始。"""
    all_persons = db.query(Person).all()

    # 建立 id -> person 對照與 children 映射
    person_map: dict[int, Person] = {p.id: p for p in all_persons}
    children_map: dict[int | None, list[Person]] = {}
    for p in all_persons:
        children_map.setdefault(p.father_id, []).append(p)

    def build_node(person: Person) -> TreeNode:
        kids = children_map.get(person.id, [])
        kids.sort(key=lambda c: (c.generation or 0, c.id))
        return TreeNode(
            id=person.id,
            old_id=person.old_id,
            name=person.name,
            generation=person.generation,
            branch=person.branch,
            gender=person.gender,
            birth_year=person.birth_year,
            death_year=person.death_year,
            is_alive=person.is_alive,
            spouse=person.spouse,
            bio=person.bio,
            children=[build_node(c) for c in kids],
        )

    # 根節點 = father_id 為 None 的人
    roots = children_map.get(None, [])
    roots.sort(key=lambda r: (r.generation or 0, r.id))
    return [build_node(r) for r in roots]


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Person).count()
    generations = db.query(func.count(func.distinct(Person.generation))).scalar()
    branches = db.query(func.count(func.distinct(Person.branch))).scalar()
    alive = db.query(Person).filter(Person.is_alive == True).count()
    return StatsOut(total=total, generations=generations, branches=branches, alive=alive)
