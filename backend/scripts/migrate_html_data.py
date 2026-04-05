"""
從鐘氏族譜.html 擷取 INITIAL_DATA 並匯入 PostgreSQL persons 表。

用法：cd backend && .venv/Scripts/python scripts/migrate_html_data.py
"""
import json
import re
import sys
from pathlib import Path

# 確保能 import app 模組
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models.person import Person


def extract_data_from_html(html_path: str) -> list[dict]:
    """從 HTML 中擷取 INITIAL_DATA JavaScript 陣列。"""
    content = Path(html_path).read_text(encoding="utf-8")

    # 找到 INITIAL_DATA = [...]; 區段
    match = re.search(r"const INITIAL_DATA = \[(.+?)\];", content, re.DOTALL)
    if not match:
        raise ValueError("找不到 INITIAL_DATA")

    raw = "[" + match.group(1) + "]"

    # JavaScript 物件轉 JSON：補上引號
    # 把沒有引號的 key 加上引號
    raw = re.sub(r'(\w+)\s*:', r'"\1":', raw)
    # 把 null 保持不變（已是合法 JSON）
    # 把單引號的值轉成雙引號（此檔案用雙引號，不需要）

    data = json.loads(raw)
    return data


def determine_alive(person: dict) -> bool:
    """根據 deathYear 判斷是否在世。"""
    return person.get("deathYear") is None


def migrate(html_path: str):
    data = extract_data_from_html(html_path)
    print(f"擷取到 {len(data)} 筆族人資料")

    db: Session = SessionLocal()

    # 先清空舊資料（重新遷移用）
    db.query(Person).delete()
    db.commit()

    # 第一輪：建立所有 Person（不含 father_id）
    old_id_to_new_id: dict[str, int] = {}

    for p in data:
        person = Person(
            old_id=p["id"],
            name=p["name"],
            generation=p.get("generation"),
            branch=p.get("branch"),
            gender=p.get("gender"),
            birth_year=str(p["birthYear"]) if p.get("birthYear") else None,
            death_year=str(p["deathYear"]) if p.get("deathYear") else None,
            is_alive=determine_alive(p),
            spouse=p.get("spouse"),
            bio=p.get("notes") or None,
            father_id=None,  # 第二輪再設定
        )
        db.add(person)
        db.flush()  # 取得自動產生的 id
        old_id_to_new_id[p["id"]] = person.id

    db.commit()
    print(f"第一輪完成：建立 {len(old_id_to_new_id)} 筆 Person")

    # 第二輪：設定 father_id
    updated = 0
    for p in data:
        parent_old_id = p.get("parentId")
        if parent_old_id and parent_old_id in old_id_to_new_id:
            new_id = old_id_to_new_id[p["id"]]
            father_new_id = old_id_to_new_id[parent_old_id]
            person = db.get(Person, new_id)
            person.father_id = father_new_id
            updated += 1

    db.commit()
    print(f"第二輪完成：設定 {updated} 筆父子關係")

    # 驗證
    validate(db, data, old_id_to_new_id)

    db.close()
    print("\n遷移完成！")


def validate(db: Session, data: list[dict], old_id_to_new_id: dict[str, int]):
    """驗證資料完整性。"""
    print("\n--- 驗證報告 ---")

    total = db.query(Person).count()
    print(f"資料庫中族人數：{total}（原始：{len(data)}）")

    # 檢查孤立節點（有 parentId 但 father_id 為 None）
    orphans = []
    for p in data:
        if p.get("parentId"):
            new_id = old_id_to_new_id[p["id"]]
            person = db.get(Person, new_id)
            if person.father_id is None:
                orphans.append(p["id"])

    if orphans:
        print(f"警告：{len(orphans)} 筆有 parentId 但未對應到 father_id：{orphans}")
    else:
        print("父子關係完整性：通過")

    # 統計各支系人數
    from sqlalchemy import func
    branches = db.query(Person.branch, func.count()).group_by(Person.branch).all()
    print("\n各支系人數：")
    for branch, count in branches:
        print(f"  {branch}：{count} 人")

    # 統計世代
    gens = db.query(Person.generation, func.count()).group_by(Person.generation).order_by(Person.generation).all()
    print("\n各世代人數：")
    for gen, count in gens:
        print(f"  第 {gen} 世：{count} 人")


if __name__ == "__main__":
    html_path = Path(__file__).resolve().parent.parent.parent / "鐘氏族譜.html"
    if not html_path.exists():
        print(f"找不到 {html_path}")
        sys.exit(1)
    migrate(str(html_path))
