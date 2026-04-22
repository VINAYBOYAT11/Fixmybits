#!/usr/bin/env python3
"""
Personal AI Coding Assistant - Interactive CLI
A command-line interface for having conversations with Claude Sonnet 4.5

Run from the repo root:
    python tools/coding_assistant.py

Or from the tools/ directory:
    python coding_assistant.py
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Ensure tools/ is on the path so bedrock_helper can be imported
# regardless of where the script is invoked from
_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

# Load .env from repo root (one level up from tools/)
_REPO_ROOT = _TOOLS_DIR.parent
_ENV_FILE = _REPO_ROOT / ".env"

from dotenv import load_dotenv
load_dotenv(_ENV_FILE)

from bedrock_helper import BedrockHelper


class CodingAssistant:
    def __init__(self):
        """Initialize the coding assistant"""
        self.bedrock = BedrockHelper()
        self.conversation_history = []
        self.system_prompt = self._get_default_system_prompt()
        # Save conversation history next to the script in tools/
        self.history_file = _TOOLS_DIR / "conversation_history.json"
        
    def _get_default_system_prompt(self):
        """Get the default system prompt for the coding assistant"""
        return """You are an expert personal AI coding assistant. Your role is to:
- Help with code writing, debugging, and optimization
- Explain programming concepts clearly
- Provide best practices and design patterns
- Review code and suggest improvements
- Help with problem-solving and algorithm design
- Provide concise, practical solutions

Be direct and helpful. When providing code, use proper syntax highlighting with language identifiers.
Focus on clarity and practical solutions."""

    def _format_message(self, role, content):
        """Format a message for display"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        if role == "user":
            return f"\n💻 You [{timestamp}]:\n{content}\n"
        else:
            return f"\n🤖 Assistant [{timestamp}]:\n{content}\n"

    def _save_conversation(self):
        """Save conversation history to file"""
        try:
            with open(self.history_file, 'w') as f:
                json.dump(self.conversation_history, f, indent=2)
        except Exception as e:
            print(f"⚠️  Could not save conversation: {e}")

    def _load_conversation(self, filename):
        """Load a previous conversation"""
        try:
            with open(filename, 'r') as f:
                self.conversation_history = json.load(f)
            print(f"✅ Loaded conversation from {filename}")
            print(f"📝 {len(self.conversation_history)} messages in history\n")
        except FileNotFoundError:
            print(f"❌ File not found: {filename}")
        except Exception as e:
            print(f"❌ Error loading conversation: {e}")

    def _display_help(self):
        """Display help information"""
        help_text = """
╔════════════════════════════════════════════════════════════════╗
║           Personal AI Coding Assistant - Commands              ║
╚════════════════════════════════════════════════════════════════╝

📝 COMMANDS:
  /help              - Show this help message
  /clear             - Clear conversation history
  /save              - Save conversation to file
  /load <filename>   - Load a previous conversation
  /system <prompt>   - Set custom system prompt
  /history           - Show conversation history
  /exit              - Exit the assistant

💡 TIPS:
  - Type your questions or code snippets naturally
  - Use /clear to start a fresh conversation
  - Conversations are auto-saved to conversation_history.json
  - You can load previous conversations with /load

🎯 EXAMPLE QUERIES:
  "Write a Python function to sort a list"
  "Debug this code: [paste code]"
  "Explain how async/await works"
  "Review this function for performance"
"""
        print(help_text)

    def _show_history(self):
        """Display conversation history"""
        if not self.conversation_history:
            print("📭 No conversation history yet.\n")
            return
        
        print(f"\n📜 Conversation History ({len(self.conversation_history)} messages):\n")
        for i, msg in enumerate(self.conversation_history, 1):
            role = "You" if msg["role"] == "user" else "Assistant"
            content = msg["content"][:100] + "..." if len(msg["content"]) > 100 else msg["content"]
            print(f"{i}. [{role}] {content}")
        print()

    def _build_messages_for_api(self):
        """Build the messages list for the Bedrock API"""
        messages = []
        for msg in self.conversation_history:
            messages.append({
                "role": msg["role"],
                "content": [{"text": msg["content"]}]
            })
        return messages

    def chat(self, user_input):
        """Send a message and get a response"""
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_input
        })
        
        # Display user message
        print(self._format_message("user", user_input))
        
        try:
            # Prepare messages for API
            messages = self._build_messages_for_api()
            
            # Get response from Claude
            response = self.bedrock.client.converse(
                modelId=self.bedrock.model_id,
                system=[{"text": self.system_prompt}],
                messages=messages
            )
            
            assistant_response = response['output']['message']['content'][0]['text']
            
            # Add assistant response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_response
            })
            
            # Display assistant response
            print(self._format_message("assistant", assistant_response))
            
            # Auto-save conversation
            self._save_conversation()
            
        except Exception as e:
            error_msg = f"❌ Error: {str(e)}"
            print(error_msg)
            # Remove the user message if there was an error
            self.conversation_history.pop()

    def run(self):
        """Run the interactive CLI"""
        print("\n" + "="*60)
        print("🚀 Personal AI Coding Assistant")
        print("="*60)
        print(f"Model: Claude Sonnet 4.5")
        print(f"Region: {self.bedrock.region}")
        print("Type '/help' for commands or start chatting!\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if not user_input:
                    continue
                
                # Handle commands
                if user_input.startswith("/"):
                    command = user_input.split()[0].lower()
                    
                    if command == "/help":
                        self._display_help()
                    elif command == "/clear":
                        self.conversation_history = []
                        print("🗑️  Conversation cleared.\n")
                    elif command == "/save":
                        self._save_conversation()
                        print(f"💾 Conversation saved to {self.history_file}\n")
                    elif command == "/load":
                        parts = user_input.split(maxsplit=1)
                        if len(parts) > 1:
                            self._load_conversation(parts[1])
                        else:
                            print("❌ Usage: /load <filename>\n")
                    elif command == "/history":
                        self._show_history()
                    elif command == "/system":
                        prompt = user_input[len("/system"):].strip()
                        if prompt:
                            self.system_prompt = prompt
                            print(f"✅ System prompt updated.\n")
                        else:
                            print(f"Current system prompt:\n{self.system_prompt}\n")
                    elif command == "/exit":
                        print("\n👋 Goodbye!\n")
                        break
                    else:
                        print(f"❌ Unknown command: {command}. Type '/help' for available commands.\n")
                else:
                    # Regular chat message
                    self.chat(user_input)
                    
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!\n")
                break
            except Exception as e:
                print(f"❌ Unexpected error: {e}\n")


def main():
    """Main entry point"""
    if not _ENV_FILE.exists():
        print(f"❌ .env file not found at {_ENV_FILE}")
        print("Please create a .env file in the repo root with your AWS credentials.")
        sys.exit(1)

    assistant = CodingAssistant()
    assistant.run()


if __name__ == "__main__":
    main()
