import hashlib
import hmac

import pytest

from app.config import settings
from app.services.notification_provider import NotificationOutcomeUnknown
from app.services.meta_whatsapp import (
    extract_meta_messages,
    meta_whatsapp_ready,
    send_whatsapp_message,
    validate_meta_signature,
    verify_meta_challenge,
)


APP_SECRET = "meta-app-secret"
VERIFY_TOKEN = "meta-webhook-verify-token"
WABA_ID = "123456789012345"
PHONE_NUMBER_ID = "987654321098765"
ACCESS_TOKEN = "meta-access-token"
GRAPH_API_VERSION = "v24.0"


def _configure(monkeypatch) -> None:
    monkeypatch.setattr(settings, "WHATSAPP_APP_SECRET", APP_SECRET)
    monkeypatch.setattr(settings, "WHATSAPP_VERIFY_TOKEN", VERIFY_TOKEN)
    monkeypatch.setattr(settings, "WHATSAPP_BUSINESS_ACCOUNT_ID", WABA_ID)
    monkeypatch.setattr(settings, "WHATSAPP_PHONE_NUMBER_ID", PHONE_NUMBER_ID)
    monkeypatch.setattr(settings, "WHATSAPP_ACCESS_TOKEN", ACCESS_TOKEN)
    monkeypatch.setattr(settings, "WHATSAPP_GRAPH_API_VERSION", GRAPH_API_VERSION)


def _signature(raw_body: bytes) -> str:
    digest = hmac.new(APP_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def _payload(*messages: dict) -> dict:
    value = {
        "messaging_product": "whatsapp",
        "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": PHONE_NUMBER_ID,
        },
    }
    if messages:
        value["messages"] = list(messages)
    else:
        value["statuses"] = [{"id": "wamid.status", "status": "delivered"}]
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": WABA_ID,
                "changes": [{"field": "messages", "value": value}],
            }
        ],
    }


def _text_message(message_id: str = "wamid.test-1") -> dict:
    return {
        "from": "919876543210",
        "id": message_id,
        "timestamp": "1730678400",
        "type": "text",
        "text": {"body": "spot: I opened social media without deciding to"},
    }


def test_meta_configuration_and_challenge_fail_closed(monkeypatch):
    _configure(monkeypatch)

    assert meta_whatsapp_ready() is True
    assert (
        verify_meta_challenge("subscribe", VERIFY_TOKEN, "123456789")
        == "123456789"
    )
    assert verify_meta_challenge("subscribe", "wrong", "123456789") is None
    assert verify_meta_challenge("wrong", VERIFY_TOKEN, "123456789") is None
    assert verify_meta_challenge("subscribe", VERIFY_TOKEN, "") is None

    monkeypatch.setattr(settings, "WHATSAPP_APP_SECRET", None)
    assert meta_whatsapp_ready() is False
    assert verify_meta_challenge("subscribe", VERIFY_TOKEN, "123456789") is None


def test_signature_covers_the_exact_raw_json_body(monkeypatch):
    _configure(monkeypatch)
    raw_body = b'{"object":"whatsapp_business_account","entry":[]}'
    signature = _signature(raw_body)

    assert validate_meta_signature(raw_body, signature) is True
    assert validate_meta_signature(raw_body + b" ", signature) is False
    assert validate_meta_signature(raw_body, None) is False
    assert validate_meta_signature(raw_body, "sha256=invalid") is False


def test_extracts_batched_text_messages_and_normalizes_e164(monkeypatch):
    _configure(monkeypatch)
    messages = extract_meta_messages(
        _payload(_text_message("wamid.one"), _text_message("wamid.two"))
    )

    assert [message.message_id for message in messages] == ["wamid.one", "wamid.two"]
    assert [message.from_number for message in messages] == [
        "+919876543210",
        "+919876543210",
    ]
    assert messages[0].body.startswith("spot:")


def test_accepts_status_only_callbacks_without_creating_messages(monkeypatch):
    _configure(monkeypatch)

    assert extract_meta_messages(_payload()) == []


@pytest.mark.parametrize("field", ["waba", "phone"])
def test_rejects_callbacks_for_another_configured_asset(monkeypatch, field):
    _configure(monkeypatch)
    payload = _payload(_text_message())
    if field == "waba":
        payload["entry"][0]["id"] = "999999999999999"
    else:
        payload["entry"][0]["changes"][0]["value"]["metadata"][
            "phone_number_id"
        ] = "999999999999999"

    with pytest.raises(ValueError):
        extract_meta_messages(payload)


def test_non_text_message_is_claimable_but_has_no_command_body(monkeypatch):
    _configure(monkeypatch)
    image = {
        "from": "919876543210",
        "id": "wamid.image",
        "timestamp": "1730678400",
        "type": "image",
        "image": {"id": "media-id"},
    }

    messages = extract_meta_messages(_payload(image))

    assert len(messages) == 1
    assert messages[0].body is None


def test_outbound_text_uses_graph_api_bearer_auth_and_returns_wamid(
    monkeypatch,
):
    _configure(monkeypatch)
    captured = {}

    class Response:
        status_code = 200

        @staticmethod
        def json():
            return {"messages": [{"id": "wamid.accepted-message"}]}

    def capture_post(url, **kwargs):
        captured["url"] = url
        captured.update(kwargs)
        return Response()

    monkeypatch.setattr("app.services.meta_whatsapp.requests.post", capture_post)

    result = send_whatsapp_message(
        "+919876543210",
        "private outbound content " * 200,
    )

    assert result == "wamid.accepted-message"
    assert captured["url"] == (
        f"https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages"
    )
    assert captured["headers"] == {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    assert captured["json"]["messaging_product"] == "whatsapp"
    assert captured["json"]["to"] == "919876543210"
    assert len(captured["json"]["text"]["body"]) <= 1_600
    assert captured["timeout"] == 15


def test_success_without_a_valid_provider_message_id_is_uncertain(monkeypatch):
    _configure(monkeypatch)

    class Response:
        status_code = 200

        @staticmethod
        def json():
            return {"messages": []}

    monkeypatch.setattr(
        "app.services.meta_whatsapp.requests.post",
        lambda *_args, **_kwargs: Response(),
    )

    with pytest.raises(NotificationOutcomeUnknown):
        send_whatsapp_message("+919876543210", "private outbound content")


@pytest.mark.parametrize("status_code", [408, 500, 503])
def test_provider_timeout_or_server_failure_has_uncertain_outcome(
    monkeypatch, status_code
):
    _configure(monkeypatch)

    class Response:
        pass

    Response.status_code = status_code
    monkeypatch.setattr(
        "app.services.meta_whatsapp.requests.post",
        lambda *_args, **_kwargs: Response(),
    )

    with pytest.raises(NotificationOutcomeUnknown):
        send_whatsapp_message("+919876543210", "private outbound content")


def test_provider_client_rejection_is_a_definite_failure(monkeypatch):
    _configure(monkeypatch)

    class Response:
        status_code = 400

    monkeypatch.setattr(
        "app.services.meta_whatsapp.requests.post",
        lambda *_args, **_kwargs: Response(),
    )

    assert send_whatsapp_message(
        "+919876543210", "private outbound content"
    ) is False
