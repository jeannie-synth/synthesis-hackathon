"""
Smoke test — renders every dashboard page headlessly via streamlit AppTest.

Run from the streamlit/ directory:
    python test_smoke.py
Exercises real data loading and chart construction in both display modes;
any uncaught exception in a view fails the run.
"""

import sys
from pathlib import Path

from streamlit.testing.v1 import AppTest

APP_DIR = Path(__file__).parent.resolve()
VIEWS = ["welcome", "players", "tournament", "divergence", "vote", "reading",
         "debrief", "frontier", "ledger"]


def main() -> int:
    failed = False
    for name in VIEWS:
        for presentation in (False, True):
            src = (
                "import sys\n"
                f'sys.path.insert(0, "{APP_DIR}")\n'
                f"import views.{name} as v\n"
                "v.render()\n"
            )
            at = AppTest.from_string(src, default_timeout=120)
            at.session_state["presentation"] = presentation
            at.run()
            label = f"{name}{' [presentation]' if presentation else ''}"
            if at.exception:
                failed = True
                for e in at.exception:
                    print(f"FAIL {label}: {e.value}")
            else:
                print(f"PASS {label}: {len(at.markdown)} md blocks, "
                      f"{len(at.metric)} metrics")

    at = AppTest.from_file(str(APP_DIR / "app.py"), default_timeout=120).run()
    if at.exception:
        failed = True
        for e in at.exception:
            print(f"FAIL app.py: {e.value}")
    else:
        print("PASS app.py entrypoint")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
