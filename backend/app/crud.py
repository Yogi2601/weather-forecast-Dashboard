from sqlalchemy.orm import Session

from app.models import Location


def get_location_by_city(db: Session, city_name: str):
    return db.query(Location).filter(Location.city_name == city_name).first()

def create_location(db: Session, city_name: str, latitude: float, longitude: float):
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
    return db.query(Location).all()

def save_weather_history(
    db,
    location_id,
    weather_date,
    temperature_max,
    temperature_min,
    precipitation,
    wind_speed,
):
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
    from app.models import WeatherHistory
    return db.query(WeatherHistory).filter(
        WeatherHistory.location_id == location_id,
        WeatherHistory.weather_date == weather_date
    ).first() is not None


def get_weather_history(db: Session, location_id: int, days: int = 365):
    from app.models import WeatherHistory
    return db.query(WeatherHistory).filter(
        WeatherHistory.location_id == location_id
    ).order_by(WeatherHistory.weather_date).all()


def delete_location(db: Session, city_name: str):
    location = db.query(Location).filter(Location.city_name == city_name).first()
    if location:
        from app.models import WeatherHistory
        db.query(WeatherHistory).filter(WeatherHistory.location_id == location.id).delete()
        db.delete(location)
        db.commit()
        return True
    return False