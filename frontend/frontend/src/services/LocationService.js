import { Country, State, City } from 'country-state-city'

/**
 * LocationService
 * Provides clean access to country, state, and city data
 * from the country-state-city package
 */

/**
 * Get all countries
 * @returns {Array} Array of { name, isoCode }
 */
export function getAllCountries() {
  try {
    const countries = Country.getAllCountries()
    return countries.map(country => ({
      name: country.name,
      isoCode: country.isoCode,
    }))
  } catch (error) {
    console.error('Error fetching countries:', error)
    return []
  }
}

/**
 * Get states for a country
 * @param {string} countryCode - ISO code of the country (e.g., 'IN', 'US')
 * @returns {Array} Array of { name, isoCode }
 */
export function getStatesByCountry(countryCode) {
  try {
    if (!countryCode) {
      console.warn('getStatesByCountry: countryCode is required')
      return []
    }

    const states = State.getStatesOfCountry(countryCode)
    return states.map(state => ({
      name: state.name,
      isoCode: state.isoCode,
    }))
  } catch (error) {
    console.error(`Error fetching states for country ${countryCode}:`, error)
    return []
  }
}

/**
 * Get cities for a state
 * @param {string} countryCode - ISO code of the country (e.g., 'IN', 'US')
 * @param {string} stateCode - ISO code of the state (e.g., 'MH', 'CA')
 * @returns {Array} Array of { name, latitude, longitude }
 */
export function getCitiesByState(countryCode, stateCode) {
  try {
    if (!countryCode || !stateCode) {
      console.warn('getCitiesByState: both countryCode and stateCode are required')
      return []
    }

    const cities = City.getCitiesOfState(countryCode, stateCode)
    return cities.map(city => ({
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    }))
  } catch (error) {
    console.error(`Error fetching cities for ${countryCode}/${stateCode}:`, error)
    return []
  }
}

/**
 * Get country by ISO code
 * @param {string} isoCode - ISO code of the country (e.g., 'IN', 'US')
 * @returns {Object|null} { name, isoCode } or null if not found
 */
export function getCountryByCode(isoCode) {
  try {
    if (!isoCode) {
      console.warn('getCountryByCode: isoCode is required')
      return null
    }

    const country = Country.getCountryByCode(isoCode)
    if (!country) return null

    return {
      name: country.name,
      isoCode: country.isoCode,
    }
  } catch (error) {
    console.error(`Error fetching country ${isoCode}:`, error)
    return null
  }
}

/**
 * Get state by ISO codes
 * @param {string} countryCode - ISO code of the country
 * @param {string} stateCode - ISO code of the state
 * @returns {Object|null} { name, isoCode } or null if not found
 */
export function getStateByCode(countryCode, stateCode) {
  try {
    if (!countryCode || !stateCode) {
      console.warn('getStateByCode: both countryCode and stateCode are required')
      return null
    }

    const state = State.getStateByCodeAndCountry(stateCode, countryCode)
    if (!state) return null

    return {
      name: state.name,
      isoCode: state.isoCode,
    }
  } catch (error) {
    console.error(`Error fetching state ${countryCode}/${stateCode}:`, error)
    return null
  }
}

/**
 * Search for countries by name (case-insensitive partial match)
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching countries
 */
export function searchCountries(searchTerm) {
  try {
    if (!searchTerm) return getAllCountries()

    const countries = getAllCountries()
    const lowerSearchTerm = searchTerm.toLowerCase()

    return countries.filter(country =>
      country.name.toLowerCase().includes(lowerSearchTerm)
    )
  } catch (error) {
    console.error('Error searching countries:', error)
    return []
  }
}

/**
 * Search for states by name (case-insensitive partial match)
 * @param {string} countryCode - ISO code of the country
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching states
 */
export function searchStates(countryCode, searchTerm) {
  try {
    if (!countryCode) {
      console.warn('searchStates: countryCode is required')
      return []
    }

    if (!searchTerm) return getStatesByCountry(countryCode)

    const states = getStatesByCountry(countryCode)
    const lowerSearchTerm = searchTerm.toLowerCase()

    return states.filter(state =>
      state.name.toLowerCase().includes(lowerSearchTerm)
    )
  } catch (error) {
    console.error(`Error searching states in ${countryCode}:`, error)
    return []
  }
}

/**
 * Search for cities by name (case-insensitive partial match)
 * @param {string} countryCode - ISO code of the country
 * @param {string} stateCode - ISO code of the state
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching cities
 */
export function searchCities(countryCode, stateCode, searchTerm) {
  try {
    if (!countryCode || !stateCode) {
      console.warn('searchCities: both countryCode and stateCode are required')
      return []
    }

    if (!searchTerm) return getCitiesByState(countryCode, stateCode)

    const cities = getCitiesByState(countryCode, stateCode)
    const lowerSearchTerm = searchTerm.toLowerCase()

    return cities.filter(city =>
      city.name.toLowerCase().includes(lowerSearchTerm)
    )
  } catch (error) {
    console.error(`Error searching cities in ${countryCode}/${stateCode}:`, error)
    return []
  }
}
