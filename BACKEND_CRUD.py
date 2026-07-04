# File: backend/app/crud.py
# Database CRUD Operations

from sqlalchemy.orm import Session
from app.models import Location


# ============================================================================
# LOCATION CRUD OPERATIONS
# ============================================================================

def get_location_by_city(db: Session, city_name: str):
    """
    Get a location from database by city name

    Args:
        db (Session): Database session
        city_name (str): Name of the city

    Returns:
        Location: Location object or None if not found
    """
    return db.query(Location).filter(Location.city_name == city_name).first()


def create_location(db: Session, city_name: str, latitude: float, longitude: float):
    """
    Create and save a new location in database

    Args:
        db (Session): Database session
        city_name (str): Name of the city
        latitude (float): City latitude
        longitude (float): City longitude

    Returns:
        Location: Created location object
    """
    location = Location(
        city_name=city_name,
        latitude=latitude,
        longitude=longitude
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


def get_locations(db: Session):
    """
    Get all saved locations from database

    Args:
        db (Session): Database session

    Returns:
        list: List of all Location objects
    """
    return db.query(Location).all()


# ============================================================================
# WEATHER HISTORY CRUD OPERATIONS
# ============================================================================

def save_weather_history(
    db,
    location_id,
    weather_date,
    temperature_max,
    temperature_min,
    precipitation,
    wind_speed,
):
    """
    Save historical weather data for a location

    Args:
        db (Session): Database session
        location_id (int): Foreign key to Location
        weather_date (str): Date in YYYY-MM-DD format
        temperature_max (float): Maximum temperature
        temperature_min (float): Minimum temperature
        precipitation (float): Precipitation amount
        wind_speed (float): Wind speed

    Returns:
        WeatherHistory: Created weather history object
    """
    from app.models import WeatherHistory

    weather = WeatherHistory(
        location_id=location_id,
        weather_date=weather_date,
        temperature_max=temperature_max,
        temperature_min=temperature_min,
        precipitation=precipitation,
        wind_speed=wind_speed,
    )

    db.add(weather)
    db.commit()
    db.refresh(weather)

    return weather


def weather_record_exists(db, location_id: int, weather_date):
    """
    Check if a weather record already exists for a location and date

    Args:
        db (Session): Database session
        location_id (int): Location ID
        weather_date (str): Date in YYYY-MM-DD format

    Returns:
        bool: True if record exists, False otherwise
    """
    from app.models import WeatherHistory
    return db.query(WeatherHistory).filter(
        WeatherHistory.location_id == location_id,
        WeatherHistory.weather_date == weather_date
    ).first() is not None


def get_weather_history(db: Session, location_id: int, days: int = 365):
    """
    Get historical weather records for a location

    Args:
        db (Session): Database session
        location_id (int): Location ID
        days (int): Number of days to retrieve (optional)

    Returns:
        list: List of WeatherHistory objects ordered by date
    """
    from app.models import WeatherHistory
    return db.query(WeatherHistory).filter(
        WeatherHistory.location_id == location_id
    ).order_by(WeatherHistory.weather_date).all()


# ============================================================================
# DELETE OPERATIONS
# ============================================================================

def delete_location(db: Session, city_name: str):
    """
    Delete a location and its associated weather history from database

    Args:
        db (Session): Database session
        city_name (str): Name of the city to delete

    Returns:
        bool: True if location was deleted, False if not found
    """
    location = db.query(Location).filter(Location.city_name == city_name).first()
    if location:
        from app.models import WeatherHistory
        # Delete all associated weather history records first
        db.query(WeatherHistory).filter(WeatherHistory.location_id == location.id).delete()
        # Then delete the location
        db.delete(location)
        db.commit()
        return True
    return False
