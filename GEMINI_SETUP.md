# Gemini AI Integration Setup

## Overview

The Weather Dashboard now includes Google Gemini AI integration for professional weather expert responses. This guide walks you through the setup process.

## Prerequisites

1. Python 3.8+
2. Backend running (FastAPI)
3. Google account with Gemini API access

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click "Create API key"
3. Copy the API key

## Step 2: Install Required Package

```bash
cd backend
pip install google-genai
```

## Step 3: Configure Environment Variables

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   GEMINI_TIMEOUT=30
   ```

## Configuration Options

### GEMINI_API_KEY (Required)
Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikeys)

### GEMINI_MODEL (Optional)
The Gemini model to use. Default: `gemini-1.5-flash`

Available models:
- `gemini-1.5-flash` - Fast, cost-effective
- `gemini-1.5-pro` - More capable, slower
- `gemini-2.0-flash` - Latest model (if available)

### GEMINI_TIMEOUT (Optional)
API request timeout in seconds. Default: `30`

## Step 4: Verify Setup

Restart the backend server:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

You should see logs indicating Gemini is configured:
```
INFO:app.ai_service:Gemini API configured with model: gemini-2.5-flash
```

## Testing

### Test via API

```bash
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_question": "Will it rain tomorrow?",
    "weather_context": {
      "location": {
        "city": "San Francisco",
        "country": "United States"
      },
      "current_weather": {
        "temperature_2m": 18,
        "relative_humidity_2m": 75,
        "weather_code": 3
      }
    },
    "response_mode": "detailed"
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "AI response generated successfully",
  "ai_response": "Based on the current conditions in San Francisco...",
  "response_mode": "detailed",
  "metadata": {
    "ai_version": "gemini-weather-expert",
    "gemini_model": "gemini-2.5-flash"
  }
}
```

## Features

### Professional Weather Expert
- System prompt makes Gemini act as a professional meteorologist
- Only uses supplied weather context
- Never invents or assumes data
- Provides actionable recommendations

### Response Modes
- **Quick**: 1-2 sentences, up to 300 characters
- **Detailed**: 3-4 paragraphs, up to 1000 characters
- **Expert**: 5+ paragraphs, up to 2000 characters

### Conversation Memory
- Multi-turn conversations supported
- Conversation history tracked
- Weather context snapshots stored

### Error Handling
- Graceful failures if Gemini is unavailable
- Friendly error messages returned to frontend
- Detailed logging for debugging
- Timeout protection (default: 30 seconds)

## Troubleshooting

### Issue: "GEMINI_API_KEY not set in environment"

**Solution**: Ensure you've added the API key to your `.env` file and restarted the backend.

### Issue: "google-genai not installed"

**Solution**: Run `pip install google-genai`

### Issue: Timeout errors

**Solution**: Increase `GEMINI_TIMEOUT` in `.env` (e.g., to 60 seconds)

### Issue: API returns error messages

**Solution**: 
1. Check API key validity in [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Check API quotas and usage
3. Verify internet connection

## Architecture

The Gemini integration is located in `backend/app/ai_service.py`:

- `call_gemini_api()` - Makes the API request
- `format_weather_context_for_gemini()` - Formats weather data
- `format_conversation_for_gemini()` - Formats message history
- `analyze_weather_with_ai()` - Main function orchestrating the flow

## Security Best Practices

1. ✅ API key stored in `.env` (not in code)
2. ✅ No API key logging
3. ✅ Timeout protection against hanging requests
4. ✅ Error handling doesn't expose sensitive information
5. ✅ System prompt enforces data-only responses

## Monitoring

Check logs for Gemini-related activity:

```bash
# Linux/Mac
tail -f /var/log/weather-dashboard.log | grep Gemini

# Windows (if using file logging)
Get-Content weather-dashboard.log -Tail 20 | Select-String "Gemini"
```

Key log levels:
- `INFO`: Successful Gemini API calls
- `WARNING`: API unavailable, empty responses
- `ERROR`: API errors, timeout, configuration issues

## Next Steps

1. Test the AI assistant in the frontend chat panel
2. Try different response modes
3. Test conversation memory with multi-turn questions
4. Monitor logs for any issues

## Support

For issues:
1. Check logs: `GEMINI_API_KEY`, `GEMINI_MODEL` configuration
2. Verify API key is valid and has quota remaining
3. Check network connectivity
4. Review error messages in backend logs
