# [START load_menu]
from google.cloud import firestore

try:
   db = firestore.Client(database="coffee-menu")
   docs = db.collection("menu").stream()
   menu_items = []
   for doc in docs:
       item = doc.to_dict()
       item.pop("embedding", None)
       menu_items.append(item)
except Exception as e:
   st.error(f"Error loading menu from Firestore: {e}")
   menu_items = []
# [END load_menu]