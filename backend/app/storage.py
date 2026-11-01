"""Almacenamiento de sesiones en SQLite (un archivo, sin servicios extra)."""
import json
import os
import sqlite3
import time
import uuid

DB_PATH = os.getenv("DATABASE_PATH", "data.db")
SESSION_TTL_SECONDS = 24 * 3600  # las sesiones se borran despues de 24 horas


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(os.getenv("DATABASE_PATH", DB_PATH))
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sessions ("
        "id TEXT PRIMARY KEY, created_at REAL NOT NULL, data TEXT NOT NULL)"
    )
    return conn


def purge_old() -> None:
    with _connect() as conn:
        conn.execute(
            "DELETE FROM sessions WHERE created_at < ?",
            (time.time() - SESSION_TTL_SECONDS,),
        )


def create_session(data: dict) -> str:
    purge_old()
    session_id = uuid.uuid4().hex[:12]
    with _connect() as conn:
        conn.execute(
            "INSERT INTO sessions (id, created_at, data) VALUES (?, ?, ?)",
            (session_id, time.time(), json.dumps(data, ensure_ascii=False)),
        )
    return session_id


def get_session(session_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT data FROM sessions WHERE id = ?", (session_id,)
        ).fetchone()
    return json.loads(row[0]) if row else None


def save_session(session_id: str, data: dict) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE sessions SET data = ? WHERE id = ?",
            (json.dumps(data, ensure_ascii=False), session_id),
        )
