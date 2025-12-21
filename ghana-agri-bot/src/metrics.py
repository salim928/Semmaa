from __future__ import annotations
import csv, os, time
from pathlib import Path
from typing import Dict, Any, Optional

try:
    from .project_paths import data_dir
except Exception:
    def data_dir() -> Path:
        return Path(__file__).resolve().parents[1] / "data"

LOGS_DIR = data_dir() / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

CONSENT_CSV = LOGS_DIR / "consent_log.csv"
METRICS_CSV = LOGS_DIR / "metrics_log.csv"

CONSENT_HEADERS = ["ts_utc", "user_id", "username", "language", "granted", "method", "text_version"]
METRICS_HEADERS = ["ts_utc", "event", "user_id", "username", "language", "location", "extra_json"]

def _append_csv(path: Path, headers: list[str], row: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    exists = path.exists()
    with path.open("a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=headers)
        if not exists:
            w.writeheader()
        w.writerow(row)

def log_consent(user_id: int, username: Optional[str], language: str, granted: bool, method: str, text_version: str = "consent-v1-2025-09-23") -> None:
    _append_csv(CONSENT_CSV, CONSENT_HEADERS, {
        "ts_utc": int(time.time()),
        "user_id": user_id,
        "username": username or "",
        "language": language or "en",
        "granted": bool(granted),
        "method": method,
        "text_version": text_version,
    })

def log_event(event: str, user_id: int, username: Optional[str], language: str, location: Optional[str], extra_json: Optional[str] = "") -> None:
    _append_csv(METRICS_CSV, METRICS_HEADERS, {
        "ts_utc": int(time.time()),
        "event": event,
        "user_id": user_id,
        "username": username or "",
        "language": language or "en",
        "location": location or "",
        "extra_json": extra_json or "",
    })