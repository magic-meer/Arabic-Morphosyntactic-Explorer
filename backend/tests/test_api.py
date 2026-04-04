"""Integration tests for API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(app_instance):
    """Test health check endpoint returns healthy status."""
    async with AsyncClient(app=app_instance, base_url="http://test") as client:
        response = await client.get("/api/v1/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_get_verse(app_instance):
    """Test get specific verse endpoint."""
    async with AsyncClient(app=app_instance, base_url="http://test") as client:
        response = await client.get("/api/v1/verses/1/1")

    assert response.status_code == 200
    data = response.json()
    assert data["chapter"] == 1
    assert data["verse"] == 1
    assert "words" in data
    assert isinstance(data["words"], list)


@pytest.mark.asyncio
async def test_get_chapter(app_instance):
    """Test get chapter verses endpoint."""
    async with AsyncClient(app=app_instance, base_url="http://test") as client:
        response = await client.get("/api/v1/verses/1")

    assert response.status_code == 200
    data = response.json()
    assert data["chapter"] == 1
    assert "verse_count" in data
    assert "verses" in data
    assert isinstance(data["verses"], list)
    assert "limit" in data
    assert "offset" in data
    assert "has_more" in data


@pytest.mark.asyncio
async def test_get_morphology(app_instance):
    """Test get verse morphology endpoint."""
    async with AsyncClient(app=app_instance, base_url="http://test") as client:
        response = await client.get("/api/v1/morphology/1/1")

    assert response.status_code == 200
    data = response.json()
    assert data["chapter"] == 1
    assert data["verse"] == 1
    assert "words" in data
    assert isinstance(data["words"], list)
    # Check that words have morphological features
    if data["words"]:
        word = data["words"][0]
        assert "form" in word
        assert "tag" in word
        assert "features" in word
