# Di dalam tools.py
from google import genai
from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure

db = firestore.Client(project="deploy-ai-agent-506711", database="coffee-menu")
genai_client = genai.Client(
    vertexai=True,
    project="deploy-ai-agent-506711",
    location="us-central1"  # WAJIB us-central1 untuk text-embedding-004
)

def search_menu(query: str):
    # 1. Generate embedding dari input pengguna
    res = genai_client.models.embed_content(
        model="text-embedding-004",
        contents=query
    )
    query_vector = res.embeddings[0].values

    # 2. Vector Search ke Firestore
    docs = db.collection("menu").find_nearest(
        vector_field="embedding",
        query_vector=Vector(query_vector),
        distance_measure=DistanceMeasure.COSINE,
        limit=3
    ).get()

    results = []
    for doc in docs:
        results.append(doc.to_dict())
    
    return results