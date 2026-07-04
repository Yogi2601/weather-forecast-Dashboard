const API_BASE_URL = "http://127.0.0.1:8000";

export async function getCurrentWeather(city) {
  const response = await fetch(`${API_BASE_URL}/weather/${city}`);

  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  return response.json();
}

export async function getForecast(city) {
  const response = await fetch(`${API_BASE_URL}/forecast/${city}`);

  if (!response.ok) {
    throw new Error("Failed to fetch forecast");
  }

  return response.json();
}