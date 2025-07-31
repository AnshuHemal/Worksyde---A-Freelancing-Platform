import requests

GEMINI_API_KEY = "AIzaSyD84wWosXQyqzedoKGIbQbMzGP0wcPj5zE"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY

def get_gemini_response(prompt):
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    response = requests.post(GEMINI_API_URL, json=data, headers=headers)
    if response.status_code == 200:
        try:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            return "[Gemini API: Unexpected response format]"
    else:
        return f"[Gemini API Error: {response.status_code}] {response.text}" 