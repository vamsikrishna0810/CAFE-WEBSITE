# Local cafe API and admin

This is a local development service for the React preview. It stores menu items, cafe profile, hours and events in SQLite. It binds to loopback only; do not expose it to the internet or cafe Wi-Fi.

## First-time setup (Windows PowerShell)

From the project root:

```powershell
py -3.13 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -e backend
Set-Location backend
.\.venv\Scripts\python.exe -m app.setup_admin --demo
.\.venv\Scripts\alembic.exe upgrade head
.\.venv\Scripts\python.exe -m app.seed
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000
```

The `--demo` setup prints a randomly generated temporary password once. Use it only for this local prototype. To set a private password instead, run `python -m app.setup_admin` without `--demo` and follow the hidden prompts. The password is stored as a salted PBKDF2 hash in the ignored `backend/.env` file.

For the current workspace's demo credential and the short two-terminal startup guide, see [`../docs/LOCAL_SERVER_GUIDE.md`](../docs/LOCAL_SERVER_GUIDE.md).

Start the frontend in a second terminal from the project root:

```powershell
npm run dev
```

Open `/admin` on the Vite site. Admin sessions are held in the current browser tab and expire after eight hours. SQLite data stays in `backend/data/cafe.db`.

The initial menu is demo-only and starts unavailable. Edit and review each item before enabling it; prices are stored as integer paise. The admin panel is not a production CMS yet: production use still needs deployment configuration, security review, audited staff roles, rate limiting, backups and owner-approved cafe policies.
