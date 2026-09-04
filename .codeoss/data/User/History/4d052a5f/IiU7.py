# [START get_menu]
from google import genai
from google.cloud import firestore
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from google.cloud.firestore_v1.vector import Vector

def get_menu(query: str) -> str:
   """Retrieves coffee shop menu items matching the user's query.

   Args:
       query: The search query or preference to find matching menu items.

   Returns:
       str: A JSON string representing the list of top matching menu items.
   """
   try:
       # Initialize clients
       db = firestore.Client(database="coffee-menu")
       client = genai.Client()

       # Generate embedding for the search query
       response = client.models.embed_content(
           model="text-embedding-004",
           contents=query,
       )
       query_vector = response.embeddings[0].values

       # Search the Firestore database using Vector Search
       results = db.collection("menu").find_nearest(
           vector_field="embedding",
           query_vector=Vector(query_vector),
           distance_measure=DistanceMeasure.COSINE,
           limit=3,
       ).stream()

       menu_data = []
       for doc in results:
           item = doc.to_dict()
           # Remove embedding field to save tokens
           item.pop("embedding", None)
           menu_data.append(item)

       return json.dumps(menu_data)
   except Exception as e:
       return json.dumps({"error": f"Could not retrieve menu: {str(e)}"})
# [END get_menu]