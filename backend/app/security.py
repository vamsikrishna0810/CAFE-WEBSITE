import base64
import hashlib
import hmac
import os
import secrets
import time

from fastapi import Depends, Header, HTTPException, status

PASSWORD_HASH = os.getenv("CAFE_ADMIN_PASSWORD_HASH", "")
TOKEN_SECRET = os.getenv("CAFE_ADMIN_TOKEN_SECRET", "")
TOKEN_TTL_SECONDS = 8 * 60 * 60


def _password_matches(password: str) -> bool:
    try:
        salt_hex, expected_hex = PASSWORD_HASH.split("$", maxsplit=1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(expected_hex)
    except ValueError:
        return False
    actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return hmac.compare_digest(actual, expected)


def create_access_token() -> str:
    issued_at = str(int(time.time()))
    nonce = secrets.token_urlsafe(24)
    payload = f"{issued_at}.{nonce}"
    signature = hmac.new(TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return base64.urlsafe_b64encode(f"{payload}.{signature}".encode()).decode()


def _token_is_valid(token: str) -> bool:
    try:
        decoded = base64.urlsafe_b64decode(token.encode()).decode()
        issued_at, nonce, signature = decoded.split(".", maxsplit=2)
        timestamp = int(issued_at)
    except (ValueError, UnicodeDecodeError):
        return False
    if not nonce or time.time() - timestamp > TOKEN_TTL_SECONDS or timestamp > time.time() + 60:
        return False
    payload = f"{issued_at}.{nonce}"
    expected = hmac.new(TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)


def require_admin(authorization: str | None = Header(default=None)) -> None:
    if not TOKEN_SECRET or not PASSWORD_HASH:
        raise HTTPException(status_code=503, detail="Configure the local admin password first")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required")
    token = authorization.removeprefix("Bearer ")
    if not _token_is_valid(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")


def password_is_configured() -> bool:
    return bool(PASSWORD_HASH and TOKEN_SECRET)


def verify_admin_password(password: str) -> bool:
    return password_is_configured() and _password_matches(password)
