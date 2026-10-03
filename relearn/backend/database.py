"""SQLite persistence: attempts + learner_profile (with recurrence tracking)."""
import json
import os
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(os.environ.get("RELEARN_DB", Path(__file__).parent / "relearn.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS attempts (
    attempt_id       TEXT PRIMARY KEY,
    student_id       TEXT NOT NULL,
    question_id      TEXT NOT NULL,
    steps_json       TEXT NOT NULL,
    error_step_index INTEGER,
    diagnosis_json   TEXT,
    telemetry_json   TEXT,
    stage            TEXT NOT NULL,
    created_at       TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS learner_profile (
    student_id       TEXT NOT NULL,
    misconception_id TEXT NOT NULL,
    stage            TEXT NOT NULL,
    occurrence_count INTEGER NOT NULL DEFAULT 1,
    retry_count      INTEGER NOT NULL DEFAULT 0,
    last_attempt_id  TEXT,
    updated_at       TEXT NOT NULL,
    PRIMARY KEY (student_id, misconception_id)
);
"""
RESOLVED_STAGES = ("retry_passed", "transfer_passed")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with closing(connect()) as conn:
        conn.executescript(SCHEMA)
        conn.commit()


def save_attempt(r) -> None:
    with closing(connect()) as conn:
        conn.execute(
            "INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?,?)",
            (
                r.attempt_id, r.student_id, r.question_id, json.dumps(r.steps),
                r.error_step_index,
                r.diagnosis.model_dump_json() if r.diagnosis else None,
                r.telemetry.model_dump_json() if r.telemetry else None,
                r.stage, _now(),
            ),
        )
        conn.commit()


def record_diagnosis(student_id: str, misconception_id: str, attempt_id: str) -> str:
    """Log a diagnosed misconception. Returns the new stage ('diagnosed' or 'recurred')."""
    with closing(connect()) as conn:
        row = conn.execute(
            "SELECT stage FROM learner_profile WHERE student_id=? AND misconception_id=?",
            (student_id, misconception_id),
        ).fetchone()
        if row is None:
            stage = "diagnosed"
            conn.execute(
                "INSERT INTO learner_profile (student_id, misconception_id, stage, last_attempt_id, updated_at) VALUES (?,?,?,?,?)",
                (student_id, misconception_id, stage, attempt_id, _now()),
            )
        else:
            stage = "recurred" if row["stage"] in RESOLVED_STAGES else "diagnosed"
            conn.execute(
                "UPDATE learner_profile SET stage=?, occurrence_count=occurrence_count+1, last_attempt_id=?, updated_at=? "
                "WHERE student_id=? AND misconception_id=?",
                (stage, attempt_id, _now(), student_id, misconception_id),
            )
        conn.commit()
        return stage


def set_stage(student_id: str, misconception_id: str, stage: str) -> None:
    with closing(connect()) as conn:
        conn.execute(
            "UPDATE learner_profile SET stage=?, updated_at=? WHERE student_id=? AND misconception_id=?",
            (stage, _now(), student_id, misconception_id),
        )
        conn.commit()


def get_profile(student_id: str) -> list[dict]:
    with closing(connect()) as conn:
        rows = conn.execute("SELECT * FROM learner_profile WHERE student_id=?", (student_id,)).fetchall()
        return [dict(r) for r in rows]
