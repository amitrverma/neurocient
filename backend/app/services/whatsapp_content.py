MAX_WHATSAPP_BODY_LENGTH = 1_600


def truncate_whatsapp_text(value: str, max_length: int) -> str:
    normalized = value.strip()
    if len(normalized) <= max_length:
        return normalized
    if max_length <= 1:
        return "…"[:max_length]
    return normalized[: max_length - 1].rstrip() + "…"


def bounded_whatsapp_message(message: str) -> str:
    return truncate_whatsapp_text(message, MAX_WHATSAPP_BODY_LENGTH)


def microchallenge_whatsapp_message(
    title: str,
    instruction: str,
) -> str:
    prefix = "*Today's experiment*\n\n"
    footer = "\n\nHow did it go? Reply:\n1. Done\n2. Partly\n3. Didn't happen"
    title_text = truncate_whatsapp_text(title, 300)
    instruction_budget = (
        MAX_WHATSAPP_BODY_LENGTH
        - len(prefix)
        - len(title_text)
        - 1
        - len(footer)
    )
    instruction_text = truncate_whatsapp_text(instruction, instruction_budget)
    return f"{prefix}{title_text}\n{instruction_text}{footer}"
