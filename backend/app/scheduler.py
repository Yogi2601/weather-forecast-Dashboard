import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import crud, services

logger = logging.getLogger(__name__)

def refresh_all_locations():
    """
    Refresh historical weather data for all saved locations.
    Downloads only missing daily records since last record.
    Continues refreshing remaining locations if one fails.
    """
    db = SessionLocal()
    try:
        locations = crud.get_locations(db)

        if not locations:
            logger.info("No locations found to refresh")
            return

        logger.info(f"Starting daily refresh for {len(locations)} location(s)")

        success_count = 0
        fail_count = 0
        failed_locations = []

        for location in locations:
            try:
                logger.info(f"Refreshing: {location.city_name}")

                historical_data = services.get_historical_weather(
                    location.latitude,
                    location.longitude
                )

                if not historical_data:
                    logger.warning(f"Failed to fetch data for {location.city_name}")
                    fail_count += 1
                    failed_locations.append(location.city_name)
                    continue

                daily_data = historical_data.get("daily", {})
                dates = daily_data.get("time", [])
                temps_max = daily_data.get("temperature_2m_max", [])
                temps_min = daily_data.get("temperature_2m_min", [])
                precipitation = daily_data.get("precipitation_sum", [])
                wind_speed = daily_data.get("wind_speed_10m_max", [])

                inserted_count = 0

                for i, date_str in enumerate(dates):
                    if not crud.weather_record_exists(db, location.id, date_str):
                        crud.save_weather_history(
                            db,
                            location.id,
                            date_str,
                            temps_max[i] if i < len(temps_max) else None,
                            temps_min[i] if i < len(temps_min) else None,
                            precipitation[i] if i < len(precipitation) else None,
                            wind_speed[i] if i < len(wind_speed) else None,
                        )
                        inserted_count += 1

                if inserted_count > 0:
                    logger.info(f"{location.city_name}: {inserted_count} new records inserted")
                else:
                    logger.info(f"{location.city_name}: Already up to date")

                success_count += 1

            except Exception as e:
                logger.error(f"Error refreshing {location.city_name}: {str(e)}")
                fail_count += 1
                failed_locations.append(location.city_name)
                continue

        logger.info(
            f"Daily refresh complete: {success_count} succeeded, "
            f"{fail_count} failed. Failed: {', '.join(failed_locations) if failed_locations else 'none'}"
        )

    except Exception as e:
        logger.error(f"Critical error in refresh_all_locations: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    refresh_all_locations()
