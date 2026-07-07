#!/usr/bin/env python
"""Quick test to verify all imports work"""

import sys
print("Python version:", sys.version)
print("=" * 50)

try:
    print("✓ Testing basic imports...")
    import app.schemas
    print("  ✓ app.schemas")

    import app.services
    print("  ✓ app.services")

    import app.city_detection
    print("  ✓ app.city_detection")

    import app.weather_context_resolver
    print("  ✓ app.weather_context_resolver")

    import app.ai_prompts
    print("  ✓ app.ai_prompts")

    import app.ai_service
    print("  ✓ app.ai_service")

    import app.ai_routes
    print("  ✓ app.ai_routes")

    import app.main
    print("  ✓ app.main")

    print("\n" + "=" * 50)
    print("✅ ALL IMPORTS SUCCESSFUL!")

except Exception as e:
    print(f"\n❌ IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
