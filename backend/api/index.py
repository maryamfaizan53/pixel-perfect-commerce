"""Vercel Python entrypoint — serves the FastAPI ASGI app.

Vercel's @vercel/python runtime detects a module-level `app` (ASGI) and wraps
it. All routes are rewritten to this function via ../vercel.json.
"""
import sys
from pathlib import Path

# project root (backend/) on the path so `import app.*` resolves
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402,F401
