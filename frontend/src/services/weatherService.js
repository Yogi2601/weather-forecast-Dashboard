// Use /api proxy which works for both localhost and ngrok
const BACKEND_URL = "/api";

function mapWeatherResponse(data, fallbackCityName) {
  return {
    city: data.resolvedCityName ?? fallbackCityName,

    latitude: data.latitude,
    longitude: data.longitude,

    temp: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),

    humidity: data.current.relative_humidity_2m,

    wind: Math.round(data.current.wind_speed_10m),
    windGust: Math.round(data.current.wind_gusts_10m ?? data.current.wind_speed_10m),

    windDirection: data.current.wind_direction_10m,

    pressure: Math.round(data.current.pressure_msl),

    visibility: Math.round((data.current.visibility ?? 0) / 1000),

    uvIndex: data.current.uv_index,

    condition: data.current.condition ?? "Unknown",
    desc: data.current.condition ?? "Live weather",
    icon: data.current.icon ?? "cloudy",
    themeKey: data.current.theme_key,
    isDay: data.current.is_day,

    tempMax: data.forecast?.[0]?.tempMax ?? 0,
    tempMin: data.forecast?.[0]?.tempMin ?? 0,

    forecast: data.forecast ?? [],
    hourlyForecast: data.hourlyForecast ?? [],

    sunrise: data.sunrise,
    sunset: data.sunset,
  };
}

export async function fetchWeatherForCity(cityName) {
  let response;

  try {
    response = await fetch(
      `${BACKEND_URL}/weather/${encodeURIComponent(cityName)}`
    );
  } catch (err) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  if (!response.ok) {
    throw new Error(`No weather data found for "${cityName}".`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  const data = await response.json();

  if (data.message) {
    throw new Error(data.message);
  }

  return mapWeatherResponse(data, cityName);
}

export async function fetchWeatherByCoordinates(latitude, longitude) {
  let response;

  try {
    response = await fetch(
      `${BACKEND_URL}/weather/coords/${latitude}/${longitude}`
    );
  } catch (err) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  if (!response.ok) {
    throw new Error("Unable to load weather for your location.");
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  const data = await response.json();

  if (data.message) {
    throw new Error(data.message);
  }

  return mapWeatherResponse(data, "Current Location");
}

export async function getWeatherByCoordinates({ name }) {
  return fetchWeatherForCity(name);
}

export async function fetchAirQualityForCity(cityName) {
  let response;

  try {
    response = await fetch(
      `${BACKEND_URL}/air-quality/${encodeURIComponent(cityName)}`
    );
  } catch (err) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  if (!response.ok) {
    throw new Error(`No air quality data found for "${cityName}".`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  const data = await response.json();

  if (data.message) {
    throw new Error(data.message);
  }

  return data;
}

export async function fetchAlertsForCity(cityName) {
  let response;

  try {
    response = await fetch(
      `${BACKEND_URL}/alerts/${encodeURIComponent(cityName)}`
    );
  } catch (err) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  if (!response.ok) {
    throw new Error(`No alert data found for "${cityName}".`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  const data = await response.json();

  if (data.message) {
    throw new Error(data.message);
  }

  return data.alerts ?? [];
}

export async function searchLocations(query, { signal } = {}) {
  if (!query || query.trim().length < 2) return [];

  let response;

  try {
    response = await fetch(
      `${BACKEND_URL}/search/${encodeURIComponent(query.trim())}`,
      { signal }
    );
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  if (!response.ok) return [];

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return [];

  const data = await response.json();
  return data.results ?? [];
}

export async function searchLocationsByCategory(query, category, { signal } = {}) {
  // Allow empty query for fetching all items in a category
  const searchQuery = query && query.trim().length > 0 ? query.trim() : "a";

  // Pluralize category for API endpoint: country -> countries, state -> states, city -> cities
  const pluralCategory = category === "city" ? "cities" : category === "state" ? "states" : "countries";

  let response;

  try {
    response = await fetch(
      `${BACKEND_URL}/search/${pluralCategory}/${encodeURIComponent(searchQuery)}`,
      { signal }
    );
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  if (!response.ok) return [];

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return [];

  const data = await response.json();
  return data.results ?? [];
}

export async function getWeatherResults(condition) {
  if (!condition) return [];

  let response;

  try {
    response = await fetch(`${BACKEND_URL}/weather-results/${encodeURIComponent(condition)}`);
  } catch (err) {
    throw new Error("Cannot reach the weather server — is the backend running?");
  }

  if (!response.ok) return [];

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return [];

  const data = await response.json();
  return data.results ?? [];
}

// ============================================================================
// HIERARCHICAL SEARCH SERVICE - With Caching & Weather Filtering
// ============================================================================

// Cache for reducing API calls
const cache = {
  countries: null,
  states: {}, // keyed by country name
  cities: {}, // keyed by "country:state"
  weather: {}, // keyed by "lat:lng"
};

const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const cacheTimestamps = {};

/**
 * Check if cache entry is still valid
 */
function isCacheValid(key) {
  const timestamp = cacheTimestamps[key];
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_EXPIRY_MS;
}

/**
 * Set cache with timestamp
 */
function setCache(key, value) {
  cacheTimestamps[key] = Date.now();
  return value;
}

/**
 * Get all countries with caching
 */
export async function getCountries() {
  if (cache.countries && isCacheValid('countries')) {
    return cache.countries;
  }

  try {
    const results = await searchLocationsByCategory('a', 'country');

    const uniqueCountries = {};
    results.forEach((result) => {
      if (result.country) {
        uniqueCountries[result.country] = {
          name: result.country,
          id: result.country.toLowerCase().replace(/\s+/g, '-'),
        };
      }
    });

    const countries = Object.values(uniqueCountries).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    cache.countries = setCache('countries', countries);
    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

/**
 * Get states for a country with caching
 */
export async function getStatesByCountry(countryName) {
  const cacheKey = `states:${countryName}`;

  if (cache.states[countryName] && isCacheValid(cacheKey)) {
    return cache.states[countryName];
  }

  try {
    const results = await searchLocationsByCategory(countryName, 'state');

    const uniqueStates = {};
    if (results && Array.isArray(results)) {
      results.forEach((result) => {
        if (result.region && result.country === countryName) {
          uniqueStates[result.region] = {
            name: result.region,
            id: result.region.toLowerCase().replace(/\s+/g, '-'),
          };
        }
      });
    }

    const states = Object.values(uniqueStates).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    cache.states[countryName] = setCache(cacheKey, states);
    return states;
  } catch (error) {
    console.error(`Error fetching states for ${countryName}:`, error);
    return [];
  }
}

/**
 * Get cities for a country and state with caching
 */
export async function getCitiesByCountryState(countryName, stateName) {
  const cacheKey = `cities:${countryName}:${stateName}`;

  if (cache.cities[cacheKey] && isCacheValid(cacheKey)) {
    return cache.cities[cacheKey];
  }

  try {
    // Search for cities in the state
    const query = `${stateName}, ${countryName}`;
    const results = await searchLocationsByCategory(query, 'city');

    const uniqueCities = {};
    if (results && Array.isArray(results)) {
      results.forEach((result) => {
        if (result.name && result.region === stateName) {
          const key = `${result.name}:${result.latitude}:${result.longitude}`;
          uniqueCities[key] = {
            name: result.name,
            region: result.region,
            country: result.country,
            latitude: result.latitude,
            longitude: result.longitude,
            id: `${result.name}:${result.latitude}:${result.longitude}`,
          };
        }
      });
    }

    const cities = Object.values(uniqueCities).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    cache.cities[cacheKey] = setCache(cacheKey, cities);
    return cities;
  } catch (error) {
    console.error(`Error fetching cities for ${countryName}/${stateName}:`, error);
    return [];
  }
}

/**
 * Fetch weather data for a location with caching
 */
export async function getWeatherDataForLocation(latitude, longitude) {
  const cacheKey = `weather:${latitude}:${longitude}`;

  if (cache.weather[cacheKey] && isCacheValid(cacheKey)) {
    return cache.weather[cacheKey];
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/weather/coords/${latitude}/${longitude}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    const weatherData = {
      temperature: data.current?.temperature_2m ?? 0,
      weather_code: data.current?.weather_code,
      wind_speed: data.current?.wind_speed_10m ?? 0,
      wind_gust: data.current?.wind_gusts_10m ?? 0,
      relative_humidity: data.current?.relative_humidity_2m ?? 0,
      condition: data.current?.condition ?? 'Unknown',
    };

    cache.weather[cacheKey] = setCache(cacheKey, weatherData);
    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather for ${latitude},${longitude}:`, error);
    return null;
  }
}

/**
 * Get cities filtered by weather condition
 */
export async function getCitiesByWeather(countryName, stateName, weatherCondition) {
  try {
    // Get all cities first
    const cities = await getCitiesByCountryState(countryName, stateName);

    if (!cities || cities.length === 0) {
      return [];
    }

    // Fetch weather for each city concurrently (limit to 15 to avoid overload)
    const citiesToCheck = cities.slice(0, 15);
    const weatherPromises = citiesToCheck.map((city) =>
      getWeatherDataForLocation(city.latitude, city.longitude)
        .then((weather) => ({
          ...city,
          weather,
        }))
        .catch(() => null)
    );

    const citiesWithWeather = (await Promise.all(weatherPromises)).filter(Boolean);

    // Filter by weather condition
    const filtered = citiesWithWeather.filter((city) =>
      matchesWeatherCondition(city.weather, weatherCondition)
    );

    return filtered;
  } catch (error) {
    console.error('Error filtering cities by weather:', error);
    return [];
  }
}

/**
 * Check if weather data matches the selected condition
 * Thresholds: Hot >= 32°C, Cold <= 10°C, Windy > 25 km/h
 */
function matchesWeatherCondition(weather, condition) {
  if (!weather) return false;

  const temp = weather.temperature || 0;
  const windSpeed = weather.wind_speed || 0;
  const code = weather.weather_code;

  switch (condition) {
    case 'sunny':
      return code === 0 || code === 1;
    case 'partly-cloudy':
      return code === 2;
    case 'cloudy':
      return code === 3;
    case 'rainy':
      return [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
    case 'thunderstorm':
      return [95, 96, 99].includes(code);
    case 'snowy':
      return [71, 73, 75, 77, 85, 86].includes(code);
    case 'foggy':
      return code === 45 || code === 48;
    case 'windy':
      return windSpeed > 25;
    case 'hot':
      return temp >= 32;
    case 'cold':
      return temp <= 10;
    default:
      return false;
  }
}

/**
 * Clear all caches (useful for manual refresh)
 */
export function clearWeatherCache() {
  cache.countries = null;
  cache.states = {};
  cache.cities = {};
  cache.weather = {};
  Object.keys(cacheTimestamps).forEach(key => delete cacheTimestamps[key]);
}