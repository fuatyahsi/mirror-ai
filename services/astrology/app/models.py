from pydantic import BaseModel, Field


class NatalChartRequest(BaseModel):
    birth_date: str = Field(examples=["1998-08-24"])
    birth_time: str = Field(default="12:00", examples=["14:30"])
    latitude: float = Field(ge=-90, le=90, examples=[41.0082])
    longitude: float = Field(ge=-180, le=180, examples=[28.9784])
    timezone: str = Field(default="UTC", examples=["Europe/Istanbul"])
    house_system: str = Field(default="P", min_length=1, max_length=1)


class ZodiacPoint(BaseModel):
    key: str
    label: str
    absolute_degree: float
    sign_key: str
    sign_label: str
    degree: float

