# Personal AI Coding Assistant

A command-line interface for having interactive conversations with Claude Sonnet 4.5 via AWS Bedrock.

## Features

- 🤖 **Multi-turn conversations** - Maintain context across multiple messages
- 💾 **Conversation history** - Auto-saves and can load previous conversations
- 🎯 **Specialized for coding** - Optimized system prompt for programming assistance
- ⚡ **Fast responses** - Direct integration with AWS Bedrock
- 🛠️ **Customizable** - Change system prompts on the fly
- 📝 **Command interface** - Easy-to-use commands for managing conversations

## Prerequisites

- Python 3.8+
- AWS account with Bedrock access
- AWS credentials configured (via `.env` file)
- Required Python packages: `boto3`, `python-dotenv`

## Setup

1. **Install dependencies:**
   ```bash
   pip install boto3 python-dotenv
   ```

2. **Configure `.env` file:**
   ```
   AWS_BEARER_TOKEN_BEDROCK=your_api_key_here
   AWS_DEFAULT_REGION=us-east-1
   ```

3. **Run the assistant:**
   ```bash
   python tools/coding_assistant.py
   ```

## Usage

### Basic Chat
Simply type your questions or code snippets:
```
You: Write a Python function to calculate fibonacci numbers
```

### Available Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/clear` | Clear conversation history and start fresh |
| `/save` | Save current conversation to `conversation_history.json` |
| `/load <filename>` | Load a previous conversation |
| `/history` | Display conversation history |
| `/system <prompt>` | Set a custom system prompt |
| `/exit` | Exit the assistant |

### Examples

**Get coding help:**
```
You: How do I implement a binary search tree in Python?
```

**Debug code:**
```
You: Debug this code:
def factorial(n):
    return n * factorial(n-1)
```

**Review code:**
```
You: Review this function for performance issues:
[paste your code]
```

**Change system prompt:**
```
You: /system You are a Python expert focused on performance optimization
```

**Load previous conversation:**
```
You: /load my_previous_chat.json
```

## File Structure

- `tools/coding_assistant.py` - Main CLI application
- `tools/bedrock_helper.py` - AWS Bedrock integration helper
- `.env` - Configuration file with AWS credentials
- `conversation_history.json` - Auto-saved conversation history

## How It Works

1. **Initialization**: Loads AWS credentials from `.env` and initializes Bedrock client
2. **Conversation Management**: Maintains full conversation history for context
3. **API Integration**: Sends messages to Claude Sonnet 4.5 via AWS Bedrock
4. **Auto-save**: Automatically saves conversations after each exchange
5. **Command Processing**: Handles special commands for managing conversations

## Tips

- Conversations are automatically saved after each message
- Use `/clear` to start a fresh conversation without losing previous ones
- Save important conversations with `/save` before clearing
- You can load multiple conversations to compare or continue them
- The system prompt can be customized for different use cases

## Troubleshooting

**"Access denied" error:**
- Check your AWS credentials in `.env`
- Verify Bedrock model access is enabled in AWS console

**"Model not found" error:**
- Ensure the model ID is correct: `anthropic.claude-3-5-sonnet-20241022-v2:0`
- Check your AWS region is correct

**Connection issues:**
- Verify internet connection
- Check AWS credentials are valid
- Ensure AWS_DEFAULT_REGION is set correctly

## Model Information

- **Model**: Claude Sonnet 4.5 (anthropic.claude-sonnet-4-5-20250929-v1:0)
- **Provider**: AWS Bedrock
- **Context Window**: 200K tokens
- **Optimized for**: Code generation, analysis, and debugging

## License

Personal use only. Ensure compliance with AWS and Anthropic terms of service.
