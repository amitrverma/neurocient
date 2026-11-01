class NotificationProviderRejected(RuntimeError):
    """Provider certainly rejected delivery; no external effect occurred."""


class NotificationOutcomeUnknown(RuntimeError):
    """Transport failed after submission may have begun; do not auto-retry."""
