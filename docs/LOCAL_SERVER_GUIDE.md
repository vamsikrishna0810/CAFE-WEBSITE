# Start the local cafe site and admin

The project has two local services: the Vite website and the FastAPI/SQLite API. Start each in its own PowerShell terminal from the project folder.

## 1. Start the API

```powershell
Set-Location .\backend
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000
```

Keep this terminal open while using the site. The API listens on this computer only and saves data to `backend/data/cafe.db`.

## 2. Start the website

Open a second terminal in the project folder:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Open the public site at [http://127.0.0.1:5173](http://127.0.0.1:5173) and the admin panel at [http://127.0.0.1:5173/admin](http://127.0.0.1:5173/admin).

## Admin sign-in

There is no username. For the current local workspace, enter this temporary demo password:

```text
I5QUVM8sWjk7vjCDDTe3
```

This credential only matches the ignored `backend/.env` created for this workspace. It is for the local demo; the API binds to `127.0.0.1` and must not be exposed to a network. The password itself is not stored in the repository; only its salted hash is in the ignored environment file.

For a fresh setup, follow the installation steps in [`../backend/README.md`](../backend/README.md). Running `python -m app.setup_admin --demo` generates and prints a new random password; use that one instead of the credential above.

## Demo data

The initial menu, cafe profile, and prices are examples. Menu items start unavailable. Review them in Admin before making an item available. Reservations remain disabled until real booking rules and a reachable booking service are configured.
