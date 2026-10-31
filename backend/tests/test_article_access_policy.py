from app.services.membership import decide_article_access


def test_paid_membership_grants_without_consuming_free_allowance():
    decision = decide_article_access(
        membership_active=True,
        already_granted=False,
        used=20,
        limit=20,
    )

    assert decision.granted is True
    assert decision.consume is False
    assert decision.remaining is None


def test_revisit_is_idempotent_even_after_free_limit_is_reached():
    decision = decide_article_access(
        membership_active=False,
        already_granted=True,
        used=20,
        limit=20,
    )

    assert decision.granted is True
    assert decision.consume is False
    assert decision.remaining == 0


def test_last_free_article_consumes_slot_and_reports_zero_remaining():
    decision = decide_article_access(
        membership_active=False,
        already_granted=False,
        used=19,
        limit=20,
    )

    assert decision.granted is True
    assert decision.consume is True
    assert decision.remaining == 0


def test_exhausted_free_allowance_fails_closed():
    decision = decide_article_access(
        membership_active=False,
        already_granted=False,
        used=20,
        limit=20,
    )

    assert decision.granted is False
    assert decision.consume is False
    assert decision.remaining == 0
