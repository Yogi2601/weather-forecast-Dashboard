"""
AI Routes Controller
Handles all HTTP endpoints related to AI chat functionality.
Supports both new unified WeatherContext format and legacy format for backward compatibility.
"""

from fastapi import APIRouter, HTTPException
from typing import Union

from app.ai_service import analyze_weather_with_ai, format_weather_context, convert_legacy_to_unified
from app.ai_prompts import get_response_modes
from app.conversation_memory import conversation_memory
from app.schemas import (
    AIChatRequest,
    AIChatResponse,
    LegacyWeatherContextRequest,
    EnhancedAIChatRequest,
    EnhancedAIChatResponse,
    WeatherContext,
    LocationData,
)

# Create router for AI endpoints
router = APIRouter(prefix="/ai", tags=["AI Assistant"])


# ============================================================================
# Helper Endpoints
# ============================================================================

@router.get("/response-modes")
def get_available_response_modes():
    """
    Get all available AI response modes.

    Returns:
        dict: Available response modes with descriptions
    """
    return {"modes": get_response_modes()}


@router.get("/conversation/{conversation_id}")
def get_conversation_history(conversation_id: str, limit: int = 20):
    """
    Get the message history of a conversation.

    Args:
        conversation_id (str): Conversation identifier
        limit (int): Maximum number of recent messages to return

    Returns:
        dict: Conversation with message history
    """

    conversation = conversation_memory.get_conversation(conversation_id)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = conversation_memory.get_conversation_history(
        conversation_id,
        limit=limit
    )

    return {
        "conversation_id": conversation_id,
        "user_id": conversation.user_id,
        "created_at": conversation.created_at,
        "last_updated": conversation.last_updated,
        "message_count": len(messages),
        "messages": messages,
    }


@router.delete("/conversation/{conversation_id}")
def delete_conversation(conversation_id: str):
    """
    Delete a conversation and all its messages.

    Args:
        conversation_id (str): Conversation identifier

    Returns:
        dict: Success status
    """

    success = conversation_memory.delete_conversation(conversation_id)

    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "success": True,
        "message": f"Conversation {conversation_id} deleted successfully"
    }


@router.post("/conversation/{conversation_id}/clear")
def clear_conversation(conversation_id: str):
    """
    Clear all messages in a conversation (keeps the conversation).

    Args:
        conversation_id (str): Conversation identifier

    Returns:
        dict: Success status
    """

    success = conversation_memory.clear_conversation(conversation_id)

    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "success": True,
        "message": f"Messages cleared from conversation {conversation_id}"
    }


# ============================================================================
# Main Chat Routes
# ============================================================================

@router.post("/chat", response_model=EnhancedAIChatResponse)
def chat_with_ai(request: Union[EnhancedAIChatRequest, AIChatRequest, LegacyWeatherContextRequest]):
    """
    Chat endpoint for AI Weather Assistant.

    Supports three formats:
    1. Enhanced Format (Recommended): Unified + response modes + conversation support
    2. New Format: Unified WeatherContext
    3. Legacy Format: Individual weather parameters

    Features:
    - Professional weather expert system prompt
    - Multiple response modes (quick, detailed, expert)
    - Conversation memory support
    - Context-only responses (never invents data)

    Args:
        request: EnhancedAIChatRequest, AIChatRequest, or LegacyWeatherContextRequest

    Returns:
        EnhancedAIChatResponse: AI response with metadata and conversation support

    Raises:
        HTTPException: If processing fails
    """

    try:
        # Parse request
        if isinstance(request, dict):
            raw_data = request
        else:
            raw_data = request.dict() if hasattr(request, 'dict') else {}

        # Determine request format and parse accordingly
        is_enhanced = (
            "weather_context" in raw_data and
            ("response_mode" in raw_data or "conversation_id" in raw_data)
        )
        is_unified = "weather_context" in raw_data
        is_legacy = "city" in raw_data

        user_question = None
        weather_context = None
        response_mode = "detailed"
        conversation_id = None
        previous_messages = None
        user_id = None

        if is_enhanced:
            # Enhanced format with response modes and conversation
            enhanced_request = EnhancedAIChatRequest(**raw_data) if isinstance(raw_data, dict) else request
            user_question = enhanced_request.user_question
            weather_context = enhanced_request.weather_context
            response_mode = enhanced_request.response_mode or "detailed"
            conversation_id = enhanced_request.conversation_id
            previous_messages = enhanced_request.previous_messages
            user_id = enhanced_request.user_id

        elif is_unified:
            # New unified format (without response modes)
            unified_request = AIChatRequest(**raw_data) if isinstance(raw_data, dict) else request
            user_question = unified_request.user_question
            weather_context = unified_request.weather_context
            response_mode = "detailed"

        elif is_legacy:
            # Legacy format - convert to unified
            legacy_request = LegacyWeatherContextRequest(**raw_data) if isinstance(raw_data, dict) else request
            user_question = legacy_request.user_question
            weather_context = convert_legacy_to_unified(legacy_request)
            response_mode = "detailed"

        else:
            raise ValueError(
                "Request must contain 'weather_context' (new format) or 'city' (legacy format)"
            )

        # Call AI service with all features
        ai_result = analyze_weather_with_ai(
            user_question=user_question,
            context=weather_context,
            response_mode=response_mode,
            conversation_id=conversation_id,
            previous_messages=previous_messages,
            user_id=user_id,
        )

        # Get updated message count if using conversation
        message_count = None
        if conversation_id:
            conversation = conversation_memory.get_conversation(conversation_id)
            if conversation:
                message_count = len(conversation.messages)

        # Return enhanced response
        return EnhancedAIChatResponse(
            success=ai_result.get("success", False),
            message=ai_result.get("message", ""),
            ai_response=ai_result.get("ai_response"),
            error=ai_result.get("error"),
            conversation_id=conversation_id,
            message_count=message_count,
            response_mode=response_mode,
            received_context=ai_result.get("received_context"),
            metadata=ai_result.get("metadata"),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"AI service error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="I'm sorry, something went wrong while processing your request. Please try again."
        )
