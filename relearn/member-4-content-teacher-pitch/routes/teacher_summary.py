"""FastAPI Route Handler for GET /class/summary (W7).

Serves aggregated teacher analytics from 40 seeded students:
- T1: Class Misconception Heatmap
- T2: Student roster details with individual status
- T3: Dynamic Peer Groups with recommended remedial actions
- T4: High-priority Transfer-Failure Alerts
"""
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

DATA_DIR = Path(__file__).parent.parent / "data"

router = APIRouter()


class HeatmapItem(BaseModel):
    label: str
    count: int
    percentage: float


class PeerGroup(BaseModel):
    misconception: str
    student_ids: List[str]
    student_names: List[str]
    recommended_action: str


class TransferAlert(BaseModel):
    student_id: str
    student_name: str
    misconception: str
    transfer_domain: str
    status: str = "persists_in_new_context"
    severity: str = "high"
    notes: Optional[str] = None


class StudentProfileSummary(BaseModel):
    student_id: str
    name: str
    status: str
    stage: str
    misconception: Optional[str] = None
    transfer_domain: Optional[str] = None
    telemetry_confidence: Optional[str] = None


class ClassSummaryResponse(BaseModel):
    class_name: str
    total_students: int
    data_disclaimer: str
    misconception_heatmap: List[HeatmapItem]
    peer_groups: List[PeerGroup]
    transfer_failure_alerts: List[TransferAlert]
    students: Optional[List[StudentProfileSummary]] = None


RECOMMENDED_ACTIONS = {
    "PARTIAL_DISTRIBUTION": "Peer review: Rectangle Area Model workshop (Visual proof C4)",
    "SQUARE_OF_SUM": "Peer review: Split Square Geometric Tiles lab",
    "NEGATIVE_DISTRIBUTION": "Peer review: Number-Line Vector Directional Reversals",
    "TRANSPOSITION": "Peer review: Two-Pan Balance Scale equation workshop",
    "UNLIKE_TERMS": "Peer review: Physical Attribute Tiles & Dimensional Units lab",
    "NEG_TIMES_NEG": "Peer review: Rate of Change & Direction Analysis workshop",
}

CORE_MISCONCEPTIONS = [
    "PARTIAL_DISTRIBUTION",
    "SQUARE_OF_SUM",
    "NEGATIVE_DISTRIBUTION",
    "TRANSPOSITION",
    "UNLIKE_TERMS",
    "NEG_TIMES_NEG",
]


def load_seeded_cohort() -> Dict[str, Any]:
    """Load seeded students JSON."""
    file_path = DATA_DIR / "seeded_students.json"
    if not file_path.exists():
        return {"students": []}
    return json.loads(file_path.read_text(encoding="utf-8"))


def compute_class_summary(include_students: bool = True) -> ClassSummaryResponse:
    """Compute the class-wide analytics summary."""
    data = load_seeded_cohort()
    students = data.get("students", [])
    total = len(students) or 40

    # T1: Misconception counts
    counts: Dict[str, int] = {m: 0 for m in CORE_MISCONCEPTIONS}
    groups: Dict[str, List[Dict[str, str]]] = {m: [] for m in CORE_MISCONCEPTIONS}
    alerts: List[TransferAlert] = []
    summaries: List[StudentProfileSummary] = []

    for s in students:
        misc = s.get("misconception")
        if misc and misc in counts:
            counts[misc] += 1
            groups[misc].append({"id": s["student_id"], "name": s["name"]})

        if s.get("stage") == "transfer_failed":
            alerts.append(
                TransferAlert(
                    student_id=s["student_id"],
                    student_name=s["name"],
                    misconception=misc or "UNKNOWN",
                    transfer_domain=s.get("transfer_domain") or "cross-domain",
                    status="persists_in_new_context",
                    severity="high",
                    notes=s.get("notes"),
                )
            )

        if include_students:
            summaries.append(
                StudentProfileSummary(
                    student_id=s["student_id"],
                    name=s["name"],
                    status=s.get("status", "mastered"),
                    stage=s.get("stage", "transfer_passed"),
                    misconception=misc,
                    transfer_domain=s.get("transfer_domain"),
                    telemetry_confidence=s.get("telemetry_confidence"),
                )
            )

    # Build heatmap
    heatmap = [
        HeatmapItem(
            label=m,
            count=counts[m],
            percentage=round((counts[m] / total) * 100, 1),
        )
        for m in CORE_MISCONCEPTIONS
    ]

    # Build peer groups (only for groups with at least 1 student)
    peer_groups = [
        PeerGroup(
            misconception=m,
            student_ids=[item["id"] for item in groups[m]],
            student_names=[item["name"] for item in groups[m]],
            recommended_action=RECOMMENDED_ACTIONS.get(m, "Small group remedial workshop"),
        )
        for m in CORE_MISCONCEPTIONS
        if groups[m]
    ]

    return ClassSummaryResponse(
        class_name="Class 8-B (Simulated Cohort)",
        total_students=total,
        data_disclaimer="Simulated Research Data (Class 8-B, 40 Students)",
        misconception_heatmap=heatmap,
        peer_groups=peer_groups,
        transfer_failure_alerts=alerts,
        students=summaries if include_students else None,
    )


@router.get("/class/summary", response_model=ClassSummaryResponse)
def get_class_summary() -> ClassSummaryResponse:
    """Serve aggregated teacher summary with heatmap, peer groups, and transfer alerts."""
    return compute_class_summary(include_students=True)
