from sqlalchemy import Column, Integer, String, DECIMAL, Date, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String(100), unique=True, nullable=False)
    latitude = Column(DECIMAL(9, 6), nullable=False)
    longitude = Column(DECIMAL(9, 6), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())


class WeatherHistory(Base):
    __tablename__ = "weather_history"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    weather_date = Column(Date, nullable=False)
    temperature_max = Column(DECIMAL(5, 2), nullable=True)
    temperature_min = Column(DECIMAL(5, 2), nullable=True)
    precipitation = Column(DECIMAL(6, 2), nullable=True)
    wind_speed = Column(DECIMAL(5, 2), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())