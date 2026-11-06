import argparse
import getpass
import hashlib
import secrets
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = BACKEND_DIR / ".env"


def main() -> None:
    parser = argparse.ArgumentParser(description="Set the local cafe admin password.")
    parser.add_argument("--demo", action="store_true", help="Use the temporary local demo password")
    args = parser.parse_args()

    if args.demo:
        password = secrets.token_urlsafe(15)
    else:
        password = getpass.getpass("New admin password: ")
        confirmation = getpass.getpass("Confirm password: ")
        if password != confirmation:
            raise SystemExit("Passwords do not match.")
        if len(password) < 12:
            raise SystemExit("Use at least 12 characters.")

    salt = secrets.token_bytes(16)
    password_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    token_secret = secrets.token_urlsafe(48)
    content = (
        "DATABASE_URL=sqlite:///./data/cafe.db\n"
        "FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173\n"
        f"CAFE_ADMIN_PASSWORD_HASH={salt.hex()}${password_hash.hex()}\n"
        f"CAFE_ADMIN_TOKEN_SECRET={token_secret}\n"
    )
    ENV_PATH.write_text(content, encoding="utf-8")
    label = "Temporary demo password" if args.demo else "Admin password"
    print(f"{label}: {password}\nStored only as a salted hash in ignored backend/.env.")


if __name__ == "__main__":
    main()
