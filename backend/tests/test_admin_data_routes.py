from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

from app.Routes import admin_data_routes, cohort_routes
from app.services.admin import require_admin


def test_every_admin_data_route_requires_admin():
    for route in admin_data_routes.router.routes:
        dependency_calls = {dependency.call for dependency in route.dependant.dependencies}
        assert require_admin in dependency_calls, route.path


def test_existing_admin_routes_are_unique_and_require_admin():
    seen = set()
    for route in cohort_routes.router.routes:
        if not route.path.startswith("/admin/"):
            continue
        dependency_calls = {dependency.call for dependency in route.dependant.dependencies}
        assert require_admin in dependency_calls, route.path
        for method in route.methods:
            key = (method, route.path)
            assert key not in seen, key
            seen.add(key)


def test_pagination_is_bounded():
    assert admin_data_routes.pagination(0, 0) == (1, 1, 0)
    assert admin_data_routes.pagination(3, 500) == (3, 100, 200)


def test_user_payload_exposes_operational_state_without_private_content():
    user = SimpleNamespace(
        id="user-1",
        email="person@example.com",
        name="Person",
        password_hash="secret-hash",
        google_id="google-id",
        phone_number="+910000000000",
        created_at=datetime(2026, 10, 1, 9, 30),
    )
    payload = admin_data_routes.user_payload(
        user,
        roles=["member"],
        membership=SimpleNamespace(status="active", current_period_end=datetime.now(UTC).replace(tzinfo=None) + timedelta(days=7)),
        activity={"spots": 2, "practice": 1},
        delivery={"push_devices": 1, "whatsapp_enabled": False},
    )

    assert payload["auth_method"] == "password + Google"
    assert payload["membership"]["is_active"] is True
    assert payload["activity"] == {"spots": 2, "practice": 1}
    assert payload["delivery"]["push_devices"] == 1
    assert "password_hash" not in payload
    assert "google_id" not in payload
    assert "phone_number" not in payload


def test_auth_method_reports_existing_account_credentials():
    assert admin_data_routes.auth_method(SimpleNamespace(password_hash="hash", google_id=None)) == "password"
    assert admin_data_routes.auth_method(SimpleNamespace(password_hash=None, google_id="google")) == "Google"
    assert admin_data_routes.auth_method(SimpleNamespace(password_hash=None, google_id=None)) == "unknown"
