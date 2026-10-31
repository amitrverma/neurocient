from datetime import date
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.Routes import ikea_routes
from app.database import get_db
from app.utils.auth import create_access_token, get_current_user


class ScalarResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class ScalarsResult:
    def __init__(self, values):
        self.values = values

    def scalars(self):
        return self

    def all(self):
        return self.values


class TrackerSession:
    def __init__(
        self,
        *,
        worksheet,
        tracker_result=None,
        expected_worksheet_id=None,
        expected_user_id=None,
    ):
        self.worksheet = worksheet
        self.tracker_result = tracker_result
        self.expected_worksheet_id = expected_worksheet_id
        self.expected_user_id = expected_user_id
        self.execute_count = 0
        self.commits = 0
        self.added = []

    async def execute(self, statement):
        self.execute_count += 1
        if self.execute_count == 1:
            sql = str(statement)
            assert "ikea_worksheet.id" in sql
            assert "ikea_worksheet.user_id" in sql
            params = set(statement.compile().params.values())
            if self.expected_worksheet_id is not None:
                assert self.expected_worksheet_id in params
            if self.expected_user_id is not None:
                assert self.expected_user_id in params
            return ScalarResult(self.worksheet)
        return self.tracker_result

    async def commit(self):
        self.commits += 1

    def add(self, value):
        self.added.append(value)


def client_for(db, *, user_id=None):
    app = FastAPI()
    app.include_router(ikea_routes.router, prefix="/api")

    async def override_db():
        yield db

    app.dependency_overrides[get_db] = override_db
    if user_id is not None:
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=user_id)

    return TestClient(app, raise_server_exceptions=False)


@pytest.mark.parametrize(
    ("method", "path_suffix", "json_body"),
    [
        ("post", "toggle", {"date": "2026-10-31"}),
        ("get", "history", None),
        ("post", "note", {"date": "2026-10-31", "note": "A private note"}),
    ],
)
def test_tracker_routes_require_authentication(method, path_suffix, json_body):
    worksheet_id = uuid4()
    db = TrackerSession(worksheet=None)
    client = client_for(db)

    response = getattr(client, method)(
        f"/api/ikea/tracker/{worksheet_id}/{path_suffix}",
        **({"json": json_body} if json_body is not None else {}),
    )

    assert response.status_code == 401
    assert db.execute_count == 0
    assert db.commits == 0
    assert db.added == []


@pytest.mark.parametrize(
    ("method", "path_suffix", "json_body"),
    [
        ("post", "toggle", {"date": "2026-10-31"}),
        ("get", "history", None),
        ("post", "note", {"date": "2026-10-31", "note": "A private note"}),
    ],
)
def test_tracker_routes_hide_other_users_worksheets_without_mutation(
    method,
    path_suffix,
    json_body,
    monkeypatch,
):
    worksheet_id = uuid4()
    user_id = uuid4()
    db = TrackerSession(
        worksheet=None,
        expected_worksheet_id=worksheet_id,
        expected_user_id=user_id,
    )
    client = client_for(db, user_id=user_id)
    analytics_events = []
    monkeypatch.setattr(
        ikea_routes,
        "track_event",
        lambda *args, **kwargs: analytics_events.append((args, kwargs)),
    )

    response = getattr(client, method)(
        f"/api/ikea/tracker/{worksheet_id}/{path_suffix}",
        **({"json": json_body} if json_body is not None else {}),
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Worksheet not found"}
    assert db.execute_count == 1
    assert db.commits == 0
    assert db.added == []
    assert analytics_events == []


def test_owner_can_read_tracker_history():
    owner_id = uuid4()
    worksheet_id = uuid4()
    worksheet = SimpleNamespace(id=worksheet_id, user_id=owner_id)
    entry = SimpleNamespace(
        date=date(2026, 10, 31),
        completed=True,
        note="Opened the document",
    )
    db = TrackerSession(
        worksheet=worksheet,
        tracker_result=ScalarsResult([entry]),
        expected_worksheet_id=worksheet_id,
        expected_user_id=owner_id,
    )
    client = client_for(db, user_id=owner_id)

    response = client.get(f"/api/ikea/tracker/{worksheet_id}/history")

    assert response.status_code == 200
    assert response.json() == [
        {
            "date": "2026-10-31",
            "completed": True,
            "note": "Opened the document",
        }
    ]
    assert db.execute_count == 2
    assert db.commits == 0


def test_owner_can_toggle_existing_tracker_entry():
    owner_id = uuid4()
    worksheet_id = uuid4()
    worksheet = SimpleNamespace(id=worksheet_id, user_id=owner_id)
    entry = SimpleNamespace(completed=True)
    db = TrackerSession(
        worksheet=worksheet,
        tracker_result=ScalarResult(entry),
        expected_worksheet_id=worksheet_id,
        expected_user_id=owner_id,
    )
    client = client_for(db, user_id=owner_id)

    response = client.post(
        f"/api/ikea/tracker/{worksheet_id}/toggle",
        json={"date": "2026-10-31"},
    )

    assert response.status_code == 200
    assert response.json() == {"completed": False}
    assert entry.completed is False
    assert db.commits == 1
    assert db.added == []


def test_owner_can_update_existing_tracker_note():
    owner_id = uuid4()
    worksheet_id = uuid4()
    worksheet = SimpleNamespace(id=worksheet_id, user_id=owner_id)
    entry = SimpleNamespace(note="Old note")
    db = TrackerSession(
        worksheet=worksheet,
        tracker_result=ScalarResult(entry),
        expected_worksheet_id=worksheet_id,
        expected_user_id=owner_id,
    )
    client = client_for(db, user_id=owner_id)

    response = client.post(
        f"/api/ikea/tracker/{worksheet_id}/note",
        json={"date": "2026-10-31", "note": "New note"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "date": "2026-10-31",
        "note": "New note",
    }
    assert entry.note == "New note"
    assert db.commits == 1
    assert db.added == []


def test_owner_can_create_tracker_entry_by_toggling_untracked_date():
    owner_id = uuid4()
    worksheet_id = uuid4()
    worksheet = SimpleNamespace(id=worksheet_id, user_id=owner_id)
    db = TrackerSession(
        worksheet=worksheet,
        tracker_result=ScalarResult(None),
        expected_worksheet_id=worksheet_id,
        expected_user_id=owner_id,
    )
    client = client_for(db, user_id=owner_id)

    response = client.post(
        f"/api/ikea/tracker/{worksheet_id}/toggle",
        json={"date": "2026-10-31"},
    )

    assert response.status_code == 200
    assert response.json() == {"completed": True}
    assert db.commits == 1
    assert len(db.added) == 1
    assert db.added[0].worksheet_id == worksheet_id
    assert db.added[0].date == date(2026, 10, 31)
    assert db.added[0].completed is True
    assert db.added[0].note is None


def test_owner_can_add_note_to_untracked_date():
    owner_id = uuid4()
    worksheet_id = uuid4()
    worksheet = SimpleNamespace(id=worksheet_id, user_id=owner_id)
    db = TrackerSession(
        worksheet=worksheet,
        tracker_result=ScalarResult(None),
        expected_worksheet_id=worksheet_id,
        expected_user_id=owner_id,
    )
    client = client_for(db, user_id=owner_id)

    response = client.post(
        f"/api/ikea/tracker/{worksheet_id}/note",
        json={"date": "2026-10-31", "note": "First note"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "date": "2026-10-31",
        "note": "First note",
    }
    assert db.commits == 1
    assert len(db.added) == 1
    assert db.added[0].worksheet_id == worksheet_id
    assert db.added[0].date == date(2026, 10, 31)
    assert db.added[0].completed is False
    assert db.added[0].note == "First note"


class AuthSession(TrackerSession):
    def __init__(self, *, user, worksheet, tracker_result, worksheet_id):
        super().__init__(
            worksheet=worksheet,
            tracker_result=tracker_result,
            expected_worksheet_id=worksheet_id,
            expected_user_id=user.id,
        )
        self.user = user
        self.auth_resolved = False

    async def execute(self, statement):
        if not self.auth_resolved:
            self.auth_resolved = True
            sql = str(statement)
            assert "FROM users" in sql
            assert str(self.user.id) in set(statement.compile().params.values())
            return ScalarResult(self.user)
        return await super().execute(statement)


def test_owner_bearer_token_is_resolved_through_real_auth_dependency():
    owner = SimpleNamespace(id=uuid4())
    worksheet_id = uuid4()
    worksheet = SimpleNamespace(id=worksheet_id, user_id=owner.id)
    db = AuthSession(
        user=owner,
        worksheet=worksheet,
        tracker_result=ScalarsResult([]),
        worksheet_id=worksheet_id,
    )
    client = client_for(db)
    token = create_access_token({"sub": str(owner.id)})

    response = client.get(
        f"/api/ikea/tracker/{worksheet_id}/history",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json() == []
    assert db.auth_resolved is True
    assert db.execute_count == 2
