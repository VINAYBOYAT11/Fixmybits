import boto3
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

client = boto3.client("bedrock", region_name="us-east-1")

# List inference profiles
try:
    response = client.list_inference_profiles()
    print(f"Inference profiles: {len(response.get('inferenceProfileSummaries', []))}")
    for profile in response.get('inferenceProfileSummaries', []):
        print(f"  {profile['inferenceProfileId']} - {profile['inferenceProfileName']}")
except Exception as e:
    print(f"Error listing profiles: {e}")

# List models with inference profiles
try:
    response = client.list_foundation_models()
    print(f"\nTotal models: {len(response.get('modelSummaries', []))}")
    
    # Check for models with inference profiles
    for model in response.get('modelSummaries', [])[:20]:
        print(f"  {model['modelId']} - {model.get('inferenceProfileId', 'N/A')}")
except Exception as e:
    print(f"Error listing models: {e}")