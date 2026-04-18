"""Integration tests for API endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_health_check(app_instance):
    """Test health check endpoint returns healthy status."""
    async with AsyncClient(
        transport=ASGITransport(app=app_instance), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_get_verse(app_instance):
    """Test get specific verse endpoint."""
    async with AsyncClient(
        transport=ASGITransport(app=app_instance), base_url="http://test"
    ) as client:
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
    async with AsyncClient(
        transport=ASGITransport(app=app_instance), base_url="http://test"
    ) as client:
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
    async with AsyncClient(
        transport=ASGITransport(app=app_instance), base_url="http://test"
    ) as client:
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


@pytest.mark.asyncio
async def test_search_verses(app_instance):
    """Test verse search endpoint."""
    async with AsyncClient(
        transport=ASGITransport(app=app_instance), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/verses/search",
            json={"query": "mercy", "n_results": 3}
        )

    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)
    assert data["count"] <= 3


@pytest.mark.asyncio
async def test_analyze_text(app_instance):
    """Test text analysis endpoint."""
    async with AsyncClient(
        transport=ASGITransport(app=app_instance), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/morphology/analyze",
            json={"text": "بسم الله"}
        )

    assert response.status_code == 200
    data = response.json()
    assert "words" in data
    assert isinstance(data["words"], list)
    assert len(data["words"]) > 0


@pytest.mark.asyncio
async def test_chat(app_instance):
    """Test AI chat endpoint."""
    async with AsyncClient(
        transport=ASGITransport(app=app_instance), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/chat",
            json={"message": "Tell me about the word mercy in the Quran"}
        )

    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert isinstance(data["response"], str)
    assert "context_verses" in data
