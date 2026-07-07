"""
Conversation Memory Architecture

Manages conversation history and context for multi-turn interactions.
Supports receiving previous messages and maintaining context.
Storage implementation (database/cache) can be added later.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel


# ============================================================================
# Message Models
# ============================================================================

class MessageData(BaseModel):
    """Represents a single message in a conversation"""

    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        schema_extra = {
            "example": {
                "role": "user",
                "content": "Will it rain tomorrow?",
                "timestamp": "2024-01-15T15:45:00Z",
                "metadata": {
                    "response_mode": "quick",
                    "user_location": "San Francisco"
                }
            }
        }


class ConversationContext(BaseModel):
    """Represents the complete context of a conversation"""

    conversation_id: Optional[str] = None
    user_id: Optional[str] = None
    messages: List[MessageData] = []
    weather_context_snapshots: Optional[List[Dict[str, Any]]] = None
    created_at: Optional[str] = None
    last_updated: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        schema_extra = {
            "example": {
                "conversation_id": "conv_12345",
                "user_id": "user_abc",
                "messages": [
                    {
                        "role": "user",
                        "content": "Will it rain tomorrow?",
                        "timestamp": "2024-01-15T15:45:00Z"
                    },
                    {
                        "role": "assistant",
                        "content": "Based on the forecast...",
                        "timestamp": "2024-01-15T15:45:30Z"
                    }
                ],
                "created_at": "2024-01-15T15:45:00Z",
                "last_updated": "2024-01-15T15:45:30Z"
            }
        }


# ============================================================================
# In-Memory Conversation Manager (Temporary - to be replaced with persistence)
# ============================================================================

class ConversationMemoryManager:
    """
    Manages conversation history in memory.

    This is a temporary implementation for architecture preparation.
    In production, this would be backed by:
    - Redis for quick access
    - PostgreSQL for persistence
    - Or similar persistence layer

    Current usage: Demonstrates the expected interface for conversation handling.
    """

    def __init__(self):
        """Initialize the in-memory conversation storage"""
        # Format: {conversation_id: ConversationContext}
        self.conversations: Dict[str, ConversationContext] = {}

    def create_conversation(
        self,
        conversation_id: str,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ConversationContext:
        """
        Create a new conversation.

        Args:
            conversation_id (str): Unique conversation identifier
            user_id (str, optional): User identifier
            metadata (dict, optional): Additional metadata

        Returns:
            ConversationContext: New conversation object
        """

        now = datetime.utcnow().isoformat() + "Z"

        conversation = ConversationContext(
            conversation_id=conversation_id,
            user_id=user_id,
            messages=[],
            created_at=now,
            last_updated=now,
            metadata=metadata,
        )

        self.conversations[conversation_id] = conversation
        return conversation

    def get_conversation(self, conversation_id: str) -> Optional[ConversationContext]:
        """
        Retrieve a conversation by ID.

        Args:
            conversation_id (str): Conversation identifier

        Returns:
            ConversationContext: Conversation object or None if not found
        """

        return self.conversations.get(conversation_id)

    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add a message to a conversation.

        Args:
            conversation_id (str): Conversation identifier
            role (str): "user" or "assistant"
            content (str): Message content
            metadata (dict, optional): Additional metadata

        Returns:
            bool: True if successful, False if conversation not found
        """

        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return False

        message = MessageData(
            role=role,
            content=content,
            timestamp=datetime.utcnow().isoformat() + "Z",
            metadata=metadata,
        )

        conversation.messages.append(message)
        conversation.last_updated = datetime.utcnow().isoformat() + "Z"

        return True

    def get_conversation_history(
        self,
        conversation_id: str,
        limit: Optional[int] = None
    ) -> List[MessageData]:
        """
        Get message history from a conversation.

        Args:
            conversation_id (str): Conversation identifier
            limit (int, optional): Maximum number of recent messages to return

        Returns:
            List[MessageData]: Messages in chronological order
        """

        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return []

        messages = conversation.messages

        if limit:
            messages = messages[-limit:]

        return messages

    def add_weather_context_snapshot(
        self,
        conversation_id: str,
        weather_context: Dict[str, Any]
    ) -> bool:
        """
        Store a snapshot of weather context at a point in conversation.

        Useful for remembering what data was available when.

        Args:
            conversation_id (str): Conversation identifier
            weather_context (dict): Weather context snapshot

        Returns:
            bool: True if successful, False if conversation not found
        """

        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return False

        if not conversation.weather_context_snapshots:
            conversation.weather_context_snapshots = []

        snapshot = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "context": weather_context,
        }

        conversation.weather_context_snapshots.append(snapshot)
        conversation.last_updated = datetime.utcnow().isoformat() + "Z"

        return True

    def clear_conversation(self, conversation_id: str) -> bool:
        """
        Clear a conversation (delete all messages).

        Args:
            conversation_id (str): Conversation identifier

        Returns:
            bool: True if successful, False if conversation not found
        """

        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return False

        conversation.messages = []
        conversation.weather_context_snapshots = None
        conversation.last_updated = datetime.utcnow().isoformat() + "Z"

        return True

    def delete_conversation(self, conversation_id: str) -> bool:
        """
        Delete a conversation completely.

        Args:
            conversation_id (str): Conversation identifier

        Returns:
            bool: True if successful, False if conversation not found
        """

        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            return True

        return False

    def get_all_conversations_for_user(self, user_id: str) -> List[ConversationContext]:
        """
        Get all conversations for a specific user.

        Args:
            user_id (str): User identifier

        Returns:
            List[ConversationContext]: All conversations for the user
        """

        return [
            conv for conv in self.conversations.values()
            if conv.user_id == user_id
        ]


# ============================================================================
# Global Memory Manager Instance
# ============================================================================

# In production, this would be injected or come from a service container
conversation_memory = ConversationMemoryManager()
