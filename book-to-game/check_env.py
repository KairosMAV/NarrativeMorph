#!/usr/bin/env python3
"""
Check environment variables
"""
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
print(f'API Key: {repr(api_key)}')
print(f'Mock mode: {not api_key or api_key in ["mock-api-key", "test-api-key", "your-api-key-here"]}')
