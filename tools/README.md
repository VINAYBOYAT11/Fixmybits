# Tools

Internal scripts and utilities — not part of the main application.

| File                    | Description                                      |
|-------------------------|--------------------------------------------------|
| `bedrock_helper.py`     | AWS Bedrock API helper (Claude integration)      |
| `bedrock_mcp.py`        | Bedrock MCP server wrapper                       |
| `coding_assistant.py`   | Interactive CLI coding assistant using Bedrock   |
| `check_profiles.py`     | Script to inspect user profiles in the database  |
| `test_bedrock_direct.py`| Direct Bedrock API test script                   |

## Usage

These scripts require AWS credentials and the backend venv:

```bash
cd tools
python -m venv ../backend/venv   # reuse backend venv
../backend/venv/Scripts/activate
python coding_assistant.py
```

> These are dev/ops utilities. They are not deployed with the application.
