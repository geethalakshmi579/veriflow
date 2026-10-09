#!/usr/bin/env python3
"""Enable GitHub Pages on geethalakshmi579/veriflow (main branch, root path).

Run AFTER the repo exists and the `custom.github` connector is healthy:
    python3 enable_pages.py

Then the site is live at https://geethalakshmi579.github.io/veriflow/
"""
import json
import sys
import urllib.request
import urllib.error

sys.path.insert(0, "/opt/hatch/skills/skill-creator/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

API = "https://api.github.com"
OWNER = "geethalakshmi579"
REPO = "veriflow"


def api(method, path, payload=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(payload).encode() if payload is not None else None,
        method=method,
        headers={"Accept": "application/vnd.github+json",
                 "User-Agent": "muse-github-skill"},
    )
    add_surrogate_to_request(req, "custom.github",
                             allowed_hosts=["api.github.com"])
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, read_json_response(resp)
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode())
        except Exception:
            body = {}
        return e.code, body


s, me = api("GET", "/user")
assert s == 200, f"auth failed: {s} — reconnect the custom.github connector"
print("authed as", me["login"])

s, page = api("POST", f"/repos/{OWNER}/{REPO}/pages",
              {"source": {"branch": "main", "path": "/"}})
if s == 201:
    print("Pages enabled:", page.get("html_url"))
elif s == 409:
    print("Pages already enabled for this repo")
else:
    print(f"unexpected: {s} {page}")
