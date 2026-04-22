import boto3
import json
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Test direct Bedrock invocation with inference profile
client = boto3.client("bedrock-runtime", region_name="us-east-1")

prompt = "Hello, test the Bedrock integration"
# Use an inference profile for newer models
model_id = "global.anthropic.claude-sonnet-4-20250514-v1:0"

body = {
    "anthropic_version": "bedrock-2023-05-31",
    "messages": [{"role": "user", "content": prompt}],
    "max_tokens": 200
}

try:
    print("Testing Bedrock invocation...")
    response = client.invoke_model(
        modelId=model_id,
        body=json.dumps(body)
    )
    
    result = json.loads(response["body"].read())
    print("Success!")
    print(f"Response: {result['content'][0]['text']}")
    
except Exception as e:
    print(f"Error: {e}")
    print(f"Error type: {type(e)}")
    
    # Check boto3 version
    import botocore
    print(f"boto3 version: {boto3.__version__}")
    print(f"botocore version: {botocore.__version__}")