from mcp.server.fastmcp import FastMCP
import boto3
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from repo root
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

mcp = FastMCP("bedrock")

# Get AWS credentials from environment or use default credentials chain
region = os.environ.get("AWS_REGION", "us-east-1")
client = boto3.client("bedrock-runtime", region_name=region)

@mcp.tool()
def ask_claude(prompt: str, max_tokens: int = 200, model: str = "global.anthropic.claude-sonnet-4-20250514-v1:0") -> str:
    """Ask Claude a question using AWS Bedrock"""
    try:
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens
        }

        response = client.invoke_model(
            modelId=model,
            body=json.dumps(body)
        )

        result = json.loads(response["body"].read())
        return result["content"][0]["text"]
    except Exception as e:
        return f"Error calling Bedrock: {str(e)}"

@mcp.tool()
def chat_with_claude(message: str, system_prompt: str = None, model: str = "global.anthropic.claude-sonnet-4-20250514-v1:0") -> str:
    """Chat with Claude using the converse API"""
    try:
        messages = [
            {
                "role": "user",
                "content": [{"text": message}]
            }
        ]
        
        kwargs = {
            "modelId": model,
            "messages": messages
        }
        
        if system_prompt:
            kwargs["system"] = [{"text": system_prompt}]
        
        response = client.converse(**kwargs)
        return response['output']['message']['content'][0]['text']
    except Exception as e:
        return f"Error calling Bedrock: {str(e)}"

if __name__ == "__main__":
    mcp.run(transport="stdio")