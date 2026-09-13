import os
import requests

# Supabase details
URL = "https://fhhwsxzdrzidegeqkkov.supabase.co"
KEY = "sb_publishable_ZZNUXJG2rJlE5d891ATy8g_4amRfT-l"

headers = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}"
}

response = requests.get(f"{URL}/rest/v1/user_roles?select=*", headers=headers)
print("Status Code:", response.status_code)
print("Response:", response.text)
