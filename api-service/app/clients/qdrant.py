#This wrapper configures Qdrant, creates the vector collection if it doesn't exist, and handles storing vectors.

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from app.config import settings

# Initialize client (points to our Qdrant container)
qdrant_client = QdrantClient(url=settings.qdrant_url)


def init_collection():
    """Create the vector collection if it doesn't exist."""
    collections = qdrant_client.get_collections().collections
    collection_names = [col.name for col in collections]

    if settings.collection_name not in collection_names:
        qdrant_client.create_collection(
            collection_name=settings.collection_name,
            vectors_config=VectorParams(
                size=768,  # nomic-embed-text generates 768-dim vectors
                distance=Distance.COSINE
            )
        )


def store_vectors(points: list[PointStruct]):
    """Insert or update vectors in Qdrant."""
    init_collection()
    qdrant_client.upsert(
        collection_name=settings.collection_name,
        points=points,
        wait=True
    )