from app.analytics import posthog_client


class RecordingPosthog:
    def __init__(self):
        self.calls = []

    def capture(self, **kwargs):
        self.calls.append(kwargs)


def test_identify_uses_supported_capture_with_person_properties(monkeypatch):
    client = RecordingPosthog()
    monkeypatch.setattr(posthog_client, "_client", client)

    posthog_client.identify_user("user-1", {"email": "person@example.com"})

    assert client.calls == [
        {
            "distinct_id": "user-1",
            "event": "user_identified",
            "properties": {"$set": {"email": "person@example.com"}},
        }
    ]


def test_analytics_failure_does_not_break_account_flow(monkeypatch):
    class FailingPosthog:
        def capture(self, **kwargs):
            raise RuntimeError("provider unavailable")

    monkeypatch.setattr(posthog_client, "_client", FailingPosthog())

    posthog_client.identify_user("user-1", {"email": "person@example.com"})
    posthog_client.track_event("user-1", "user_signup")
