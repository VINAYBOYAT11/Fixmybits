import boto3
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from botocore.exceptions import ClientError
import json

# Load .env from repo root regardless of where this module is imported from
_REPO_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_REPO_ROOT / ".env")

class BedrockHelper:
    def __init__(self):
        self.region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        self.client = boto3.client('bedrock-runtime', region_name=self.region)
        # Use inference profile for newer models
        self.model_id = "global.anthropic.claude-sonnet-4-20250514-v1:0"
    
    def chat(self, message, system_prompt=None):
        """Send a message to Claude and get response"""
        try:
            messages = [
                {
                    "role": "user",
                    "content": [{"text": message}]
                }
            ]
            
            kwargs = {
                "modelId": self.model_id,
                "messages": messages
            }
            
            if system_prompt:
                kwargs["system"] = [{"text": system_prompt}]
            
            response = self.client.converse(**kwargs)
            return response['output']['message']['content'][0]['text']
            
        except ClientError as e:
            return f"Error: {e.response['Error']['Message']}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"

# Example usage
if __name__ == "__main__":
    bedrock = BedrockHelper()
    
    # Test the helper
    response = bedrock.chat(
        "Write a simple Python function to calculate fibonacci numbers",
        system_prompt="You are a helpful coding assistant. Provide clean, well-commented code."
    )
    
    print("🤖 Claude Response:")
    print(response)