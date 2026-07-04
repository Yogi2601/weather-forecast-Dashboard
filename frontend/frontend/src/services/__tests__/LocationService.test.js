/**
 * LocationService Verification Tests
 * Run in browser console to verify country-state-city integration
 */

import {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
  getCountryByCode,
  getStateByCode,
  searchCountries,
  searchStates,
  searchCities,
} from '../LocationService'

/**
 * Test 1: Get all countries
 */
export function testGetAllCountries() {
  console.log('\n=== TEST 1: getAllCountries() ===')
  const countries = getAllCountries()
  console.log(`✓ Fetched ${countries.length} countries`)
  console.log('Sample countries:')
  console.table(countries.slice(0, 5))
  return countries.length > 0
}

/**
 * Test 2: Get states by country (India)
 */
export function testGetStatesByCountry() {
  console.log('\n=== TEST 2: getStatesByCountry("IN") ===')
  const states = getStatesByCountry('IN')
  console.log(`✓ Fetched ${states.length} states for India`)
  console.log('Sample states:')
  console.table(states.slice(0, 5))
  return states.length > 0
}

/**
 * Test 3: Get cities by state (Maharashtra, India)
 */
export function testGetCitiesByState() {
  console.log('\n=== TEST 3: getCitiesByState("IN", "MH") ===')
  const cities = getCitiesByState('IN', 'MH')
  console.log(`✓ Fetched ${cities.length} cities in Maharashtra`)
  console.log('Sample cities:')
  console.table(cities.slice(0, 5))
  return cities.length > 0
}

/**
 * Test 4: Get country by code
 */
export function testGetCountryByCode() {
  console.log('\n=== TEST 4: getCountryByCode("IN") ===')
  const country = getCountryByCode('IN')
  console.log('✓ Country:', country)
  return country !== null
}

/**
 * Test 5: Get state by code
 */
export function testGetStateByCode() {
  console.log('\n=== TEST 5: getStateByCode("IN", "MH") ===')
  const state = getStateByCode('IN', 'MH')
  console.log('✓ State:', state)
  return state !== null
}

/**
 * Test 6: Search countries
 */
export function testSearchCountries() {
  console.log('\n=== TEST 6: searchCountries("ind") ===')
  const results = searchCountries('ind')
  console.log(`✓ Found ${results.length} countries matching "ind"`)
  console.table(results)
  return results.length > 0
}

/**
 * Test 7: Search states
 */
export function testSearchStates() {
  console.log('\n=== TEST 7: searchStates("IN", "mah") ===')
  const results = searchStates('IN', 'mah')
  console.log(`✓ Found ${results.length} states matching "mah"`)
  console.table(results)
  return results.length > 0
}

/**
 * Test 8: Search cities
 */
export function testSearchCities() {
  console.log('\n=== TEST 8: searchCities("IN", "MH", "mum") ===')
  const results = searchCities('IN', 'MH', 'mum')
  console.log(`✓ Found ${results.length} cities matching "mum"`)
  console.table(results)
  return results.length > 0
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.clear()
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║    LocationService Verification Tests                    ║')
  console.log('║    Integration: country-state-city package              ║')
  console.log('╚══════════════════════════════════════════════════════════╝')

  const results = {
    'getAllCountries': testGetAllCountries(),
    'getStatesByCountry': testGetStatesByCountry(),
    'getCitiesByState': testGetCitiesByState(),
    'getCountryByCode': testGetCountryByCode(),
    'getStateByCode': testGetStateByCode(),
    'searchCountries': testSearchCountries(),
    'searchStates': testSearchStates(),
    'searchCities': testSearchCities(),
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║    TEST RESULTS                                          ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.table(results)

  const allPassed = Object.values(results).every(r => r === true)
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!')
  } else {
    console.log('❌ Some tests failed. Check the logs above.')
  }

  return allPassed
}

// Export for browser console use
window.LocationServiceTests = {
  testGetAllCountries,
  testGetStatesByCountry,
  testGetCitiesByState,
  testGetCountryByCode,
  testGetStateByCode,
  testSearchCountries,
  testSearchStates,
  testSearchCities,
  runAllTests,
}

console.log('✓ LocationService tests loaded. Run: LocationServiceTests.runAllTests()')
