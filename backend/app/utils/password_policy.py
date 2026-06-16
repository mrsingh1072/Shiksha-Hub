import re

PASSWORD_RULES = [
    (r".{8,}", "At least 8 characters"),
    (r"[A-Z]", "One uppercase letter"),
    (r"[a-z]", "One lowercase letter"),
    (r"\d", "One number"),
    (r"[^A-Za-z0-9]", "One special character"),
]


def validate_password_strength(password: str) -> dict:
    checks = []
    for pattern, label in PASSWORD_RULES:
        checks.append({
            "label": label,
            "passed": bool(re.search(pattern, password or "")),
        })

    score = sum(1 for item in checks if item["passed"])
    valid = score == len(checks)

    strength = "weak"
    if score >= 4:
        strength = "medium"
    if valid:
        strength = "strong"

    return {
        "valid": valid,
        "strength": strength,
        "checks": checks,
    }
