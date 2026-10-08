#!/usr/bin/env python3
"""Build the public, form-only edition of index.html into docs/ for GitHub Pages.

Everything between ADMIN:START / ADMIN:END markers (HTML comments or JS block
comments) is removed: the Ministry login, the dashboard, the admin credentials and
the chart library. The family form, the success page and the storage layer stay.

Usage:  python3 build-public.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "index.html")
OUT_DIR = os.path.join(ROOT, "docs")
OUT = os.path.join(OUT_DIR, "index.html")

html = open(SRC, encoding="utf-8").read()

html_blocks = re.findall(r"<!-- ADMIN:START -->.*?<!-- ADMIN:END -->", html, re.S)
js_blocks = re.findall(r"/\* ADMIN:START \*/.*?/\* ADMIN:END \*/", html, re.S)
if not html_blocks or not js_blocks:
    sys.exit("No ADMIN markers found in index.html; refusing to build.")

out = re.sub(r"[ \t]*<!-- ADMIN:START -->.*?<!-- ADMIN:END -->[ \t]*\n?", "", html, flags=re.S)
out = re.sub(r"[ \t]*/\* ADMIN:START \*/.*?/\* ADMIN:END \*/[ \t]*\n?", "", out, flags=re.S)
out = out.replace("const PUBLIC_BUILD = false;", "const PUBLIC_BUILD = true;", 1)

# Safety checks: nothing admin-only may survive into the public file.
forbidden = ["ADMIN_USER", "ADMIN_PASS", "function renderAdmin", "function renderDash", "const Auth=", "sampleData(",
             "tpl-login", "mof_admin", "ADMIN:START", "ADMIN:END", "chart.umd.js"]
leaks = [f for f in forbidden if f in out]
if leaks:
    sys.exit("Build aborted, admin content leaked into public build: %s" % ", ".join(leaks))

api = re.search(r'API_URL:\s*"([^"]*)"', out)
os.makedirs(OUT_DIR, exist_ok=True)
open(OUT, "w", encoding="utf-8").write(out)
open(os.path.join(OUT_DIR, ".nojekyll"), "w").close()

# The full edition (form + dashboard) is also published as docs/admin.html. It is safe to
# publish: it holds only a SHA-256 hash of the admin password and the Sheets script refuses
# to return records without that password.
open(os.path.join(OUT_DIR, "admin.html"), "w", encoding="utf-8").write(html)

print("Wrote %s (%d KB, removed %d HTML and %d JS admin blocks)" % (
    os.path.relpath(OUT, ROOT), len(out.encode("utf-8")) // 1024, len(html_blocks), len(js_blocks)))
if not api or not api.group(1):
    print("WARNING: CONFIG.API_URL is empty. The public form will show a test-mode notice and "
          "submissions will not reach the committee until the Google Sheets URL is set in index.html "
          "and this build is re-run.")
