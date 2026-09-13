import os
from google import genai

API_KEY = os.environ.get("GEMINI_API_KEY")
if API_KEY:
    client = genai.Client(api_key=API_KEY)
    try:
        models = client.models.list()
        for m in models:
            print(m.name)
    except Exception as e:
        print("Error listing models:", e)
else:
    print("No API KEY")
