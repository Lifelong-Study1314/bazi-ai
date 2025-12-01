import os
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print("❌ NO API KEY FOUND")
    exit(1)

print(f"✅ API Key: {api_key[:20]}...")

from openai import OpenAI
client = OpenAI(api_key=api_key)
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hi"}],
    max_tokens=5
)
print(f"✅ API Works: {response.choices[0].message.content}")
