"""Aggregated Router for Member 4 backend routes.

Can be mounted directly by Member 1:
    from relearn.member_4_content_teacher_pitch.routes import member4_router
    app.include_router(member4_router)
"""
from fastapi import APIRouter

try:
    from .intervention import router as intervention_router
    from .teacher_summary import router as teacher_router
except (ImportError, ValueError):
    from intervention import router as intervention_router
    from teacher_summary import router as teacher_router

member4_router = APIRouter()
member4_router.include_router(intervention_router)
member4_router.include_router(teacher_router)
