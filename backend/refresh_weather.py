#!/usr/bin/env python
"""
Weather History Refresh Script
Refreshes historical weather data for all saved locations.
Can be run manually or scheduled via Windows Task Scheduler.

Usage:
    python refresh_weather.py                    # Run once and exit
    python refresh_weather.py --continuous       # Run every 24 hours
"""

import sys
import time
import logging
from datetime import datetime
import argparse

sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])

from app.scheduler import refresh_all_locations

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('weather_refresh.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def run_once():
    """Run refresh once and exit"""
    logger.info("=" * 80)
    logger.info("Weather Refresh Started")
    logger.info("=" * 80)
    refresh_all_locations()
    logger.info("=" * 80)
    logger.info("Weather Refresh Completed")
    logger.info("=" * 80)

def run_continuous():
    """Run refresh every 24 hours"""
    logger.info("=" * 80)
    logger.info("Weather Refresh Daemon Started (24-hour interval)")
    logger.info("=" * 80)

    while True:
        try:
            logger.info(f"Refresh cycle starting at {datetime.now()}")
            refresh_all_locations()
            logger.info("Sleeping for 24 hours until next refresh")
            time.sleep(86400)  # 24 hours
        except KeyboardInterrupt:
            logger.info("Refresh daemon stopped by user")
            break
        except Exception as e:
            logger.error(f"Unexpected error in continuous mode: {str(e)}")
            logger.info("Waiting 1 hour before retry")
            time.sleep(3600)  # Retry after 1 hour

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Refresh historical weather data for all locations"
    )
    parser.add_argument(
        "--continuous",
        action="store_true",
        help="Run continuously every 24 hours instead of once"
    )

    args = parser.parse_args()

    if args.continuous:
        run_continuous()
    else:
        run_once()
