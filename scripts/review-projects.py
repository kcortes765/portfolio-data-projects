"""Run the small, isolated Python review suite for both portfolio projects.

Run from the repository: python scripts/review-projects.py
Requires pipeline/requirements.txt. No database service or AI key is needed.
"""
import os
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
if os.environ.get("OPSFORGE_TEST_DSN"):
    raise SystemExit("For the isolated review, unset OPSFORGE_TEST_DSN first.")

commands = [
    [sys.executable, "-m", "unittest", "discover", "-s", "pipeline", "-v"],
    [sys.executable, "-m", "unittest", "opsforge.test_pipeline", "-v"],
]
for command in commands:
    result = subprocess.run(command, cwd=root, check=False)
    if result.returncode:
        raise SystemExit(result.returncode)
print("22 isolated Python tests passed. PostgreSQL, dbt, web UI and deployment were not tested by this command.")
