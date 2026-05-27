"""Backend API tests for Harsha 3D portfolio.
Covers: /api/, /api/health, /api/profile, /api/projects, /api/contact (POST + GET).
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback: read from frontend/.env directly (test infra hint)
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1].strip().strip('"')
                    break
BASE_URL = (BASE_URL or "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be configured"

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health / root ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "message" in data
        assert isinstance(data["message"], str) and len(data["message"]) > 0

    def test_health(self, session):
        r = session.get(f"{API}/health", timeout=15)
        assert r.status_code == 200, r.text
        assert r.json() == {"status": "ok"}


# ---------- Profile ----------
class TestProfile:
    def test_profile_shape(self, session):
        r = session.get(f"{API}/profile", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ["name", "tagline", "intro", "chips", "experience", "education", "skills", "socials"]:
            assert key in data, f"missing key {key}"
        assert data["name"] == "HARSHA"
        assert isinstance(data["chips"], list) and len(data["chips"]) > 0
        assert isinstance(data["experience"], list) and len(data["experience"]) >= 2
        # Samsung R&D Jan 2025 - Jul 2025
        periods = [e.get("period", "") for e in data["experience"]]
        assert any("Jan 2025" in p and "Jul 2025" in p for p in periods), periods
        # Freelance from Mar 2026
        assert any("Mar 2026" in p for p in periods), periods
        assert isinstance(data["skills"], list) and len(data["skills"]) > 0
        assert "email" in data["socials"]


# ---------- Projects ----------
class TestProjects:
    def test_projects_list(self, session):
        r = session.get(f"{API}/projects", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 4, f"expected 4 projects, got {len(data)}"
        titles = {p["title"] for p in data}
        assert {"My Little Adventure", "Sukhya Med", "NAutomation Labs", "V7 Computers"} == titles
        for p in data:
            for key in ["id", "title", "url", "role", "year", "description", "tags"]:
                assert key in p, f"project missing {key}: {p}"
            assert isinstance(p["tags"], list)
            assert p["url"].startswith("http")


# ---------- Contact ----------
class TestContact:
    def test_contact_post_valid_persists(self, session):
        payload = {
            "name": "TEST_Backend Tester",
            "email": "test_backend@example.com",
            "message": "TEST_marker valid contact submission",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["message"] == payload["message"]

        # Verify via list endpoint that it persisted
        r2 = session.get(f"{API}/contact", timeout=20)
        assert r2.status_code == 200, r2.text
        items = r2.json()
        assert isinstance(items, list)
        assert any(it.get("id") == data["id"] for it in items), "saved contact not found in list"

    def test_contact_invalid_email(self, session):
        r = session.post(
            f"{API}/contact",
            json={"name": "TEST_x", "email": "not-an-email", "message": "hi"},
            timeout=15,
        )
        assert r.status_code == 422, r.text

    def test_contact_empty_name(self, session):
        r = session.post(
            f"{API}/contact",
            json={"name": "", "email": "ok@example.com", "message": "hi"},
            timeout=15,
        )
        assert r.status_code == 422, r.text

    def test_contact_honeypot_accepted_but_not_persisted(self, session):
        unique_marker = "TEST_HONEYPOT_MARKER_xyz_98765"
        payload = {
            "name": "TEST_Bot",
            "email": "bot@example.com",
            "message": unique_marker,
            "company": "evilcorp",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        # response still returns a ContactMessage shape
        body = r.json()
        assert "id" in body and body["message"] == unique_marker

        # verify it was NOT persisted in the list
        r2 = session.get(f"{API}/contact?limit=500", timeout=20)
        assert r2.status_code == 200
        items = r2.json()
        assert not any(it.get("message") == unique_marker for it in items), \
            "honeypot submission should not be persisted"

    def test_contact_list_sorted_newest_first(self, session):
        # Insert two records, ensure second is newer & appears first
        import time
        first = session.post(f"{API}/contact", json={
            "name": "TEST_first", "email": "first@example.com",
            "message": "TEST_sort first",
        }, timeout=15)
        assert first.status_code == 200
        time.sleep(1.1)
        second = session.post(f"{API}/contact", json={
            "name": "TEST_second", "email": "second@example.com",
            "message": "TEST_sort second",
        }, timeout=15)
        assert second.status_code == 200

        r = session.get(f"{API}/contact?limit=500", timeout=20)
        assert r.status_code == 200
        items = r.json()
        # find indices of first and second
        idx_first = next((i for i, it in enumerate(items) if it["id"] == first.json()["id"]), None)
        idx_second = next((i for i, it in enumerate(items) if it["id"] == second.json()["id"]), None)
        assert idx_first is not None and idx_second is not None
        assert idx_second < idx_first, "newest record should appear first"
