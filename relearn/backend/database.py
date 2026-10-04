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
    student_id                 TEXT NOT NULL,
    misconception_id           TEXT NOT NULL,
    stage                      TEXT NOT NULL,
    occurrence_count           INTEGER NOT NULL DEFAULT 1,
    retry_count                INTEGER NOT NULL DEFAULT 0,
    consecutive_transfer_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_id            TEXT,
    updated_at                 TEXT NOT NULL,
    PRIMARY KEY (student_id, misconception_id)
);
"""
# A misconception the student had already fixed in algebra. If it appears again
# from any of these stages, that is a recurrence.
RESOLVED_STAGES = ("retry_passed", "transfer_in_progress", "transfer_passed")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with closing(connect()) as conn:
        conn.executescript(SCHEMA)
        # Migrate schema dynamically if table was already created
        cols = [r["name"] for r in conn.execute("PRAGMA table_info(learner_profile)").fetchall()]
        if "consecutive_transfer_count" not in cols:
            conn.execute("ALTER TABLE learner_profile ADD COLUMN consecutive_transfer_count INTEGER NOT NULL DEFAULT 0")
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
            # A new mistake breaks any transfer streak (passes must be consecutive).
            # A recurrence also starts a fresh retry cycle.
            conn.execute(
                "UPDATE learner_profile SET stage=?, occurrence_count=occurrence_count+1, "
                "consecutive_transfer_count=0, "
                "retry_count=CASE WHEN ?='recurred' THEN 0 ELSE retry_count END, "
                "last_attempt_id=?, updated_at=? WHERE student_id=? AND misconception_id=?",
                (stage, stage, attempt_id, _now(), student_id, misconception_id),
            )
        conn.execute("UPDATE attempts SET stage=? WHERE attempt_id=?", (stage, attempt_id))
        conn.commit()
        return stage


def set_stage(student_id: str, misconception_id: str, stage: str) -> None:
    with closing(connect()) as conn:
        row = conn.execute(
            "SELECT stage FROM learner_profile WHERE student_id=? AND misconception_id=?",
            (student_id, misconception_id),
        ).fetchone()
        if row is None:
            conn.execute(
                "INSERT INTO learner_profile (student_id, misconception_id, stage, occurrence_count, retry_count, updated_at) "
                "VALUES (?,?,?,1,0,?)",
                (student_id, misconception_id, stage, _now()),
            )
        else:
            conn.execute(
                "UPDATE learner_profile SET stage=?, updated_at=? WHERE student_id=? AND misconception_id=?",
                (stage, _now(), student_id, misconception_id),
            )
        conn.commit()



def record_retry(student_id: str, misconception_id: str, new_stage: str) -> int:
    """Increment retry_count and update learner profile stage."""
    with closing(connect()) as conn:
        row = conn.execute(
            "SELECT retry_count FROM learner_profile WHERE student_id=? AND misconception_id=?",
            (student_id, misconception_id),
        ).fetchone()
        retry_count = (row["retry_count"] if row else 0) + 1
        if row is None:
            conn.execute(
                "INSERT INTO learner_profile (student_id, misconception_id, stage, occurrence_count, retry_count, updated_at) "
                "VALUES (?,?,?,1,?,?)",
                (student_id, misconception_id, new_stage, retry_count, _now()),
            )
        else:
            conn.execute(
                "UPDATE learner_profile SET stage=?, retry_count=?, updated_at=? WHERE student_id=? AND misconception_id=?",
                (new_stage, retry_count, _now(), student_id, misconception_id),
            )
        conn.commit()
        return retry_count


def record_transfer(student_id: str, misconception_id: str, is_correct: bool) -> dict:
    """Update transfer progress: requires 2 consecutive correct transfers to pass."""
    with closing(connect()) as conn:
        row = conn.execute(
            "SELECT stage, consecutive_transfer_count FROM learner_profile WHERE student_id=? AND misconception_id=?",
            (student_id, misconception_id),
        ).fetchone()
        streak = (row["consecutive_transfer_count"] if row and "consecutive_transfer_count" in row.keys() else 0)
        if is_correct:
            streak += 1
            new_stage = "transfer_passed" if streak >= 2 else "transfer_in_progress"
        else:
            streak = 0
            new_stage = "transfer_failed"

        if row is None:
            conn.execute(
                "INSERT INTO learner_profile (student_id, misconception_id, stage, occurrence_count, retry_count, consecutive_transfer_count, updated_at) "
                "VALUES (?,?,?,1,0,?,?)",
                (student_id, misconception_id, new_stage, streak, _now()),
            )
        else:
            conn.execute(
                "UPDATE learner_profile SET stage=?, consecutive_transfer_count=?, updated_at=? "
                "WHERE student_id=? AND misconception_id=?",
                (new_stage, streak, _now(), student_id, misconception_id),
            )
        conn.commit()
        return {
            "stage": new_stage,
            "consecutive_transfer_count": streak,
            "transfer_verified": (streak >= 2),
        }


def get_profile(student_id: str) -> list[dict]:
    with closing(connect()) as conn:
        rows = conn.execute("SELECT * FROM learner_profile WHERE student_id=?", (student_id,)).fetchall()
        res = []
        for r in rows:
            d = dict(r)
            d["transfer_streak"] = d.get("consecutive_transfer_count", 0)
            res.append(d)
        return res


