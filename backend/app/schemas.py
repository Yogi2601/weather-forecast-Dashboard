from pydantic import BaseModel


class LocationCreate(BaseModel):
    city_name: str


class LocationResponse(BaseModel):
    id: int
    city_name: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True