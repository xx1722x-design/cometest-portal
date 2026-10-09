#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
api_key = os.getenv('GROQ_API_KEY', '')
print(f'API Key set: {bool(api_key)}')

if api_key:
    client = Groq(api_key=api_key)
    try:
        prompt = '''Return ONLY valid JSON with no markdown:
{
  "title": "Dark Game Title",
  "description": "A mysterious description"
}'''

        response = client.chat.completions.create(
            model='openai/gpt-oss-20b',
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=200,
            temperature=0.7
        )
        text = response.choices[0].message.content
        print(f'✅ Groq API works!')
        print(f'Response length: {len(text)}')
        print(f'Content: {text[:300]}')
    except Exception as e:
        print(f'❌ Groq API error: {str(e)[:200]}')
else:
    print('❌ No API key found')
