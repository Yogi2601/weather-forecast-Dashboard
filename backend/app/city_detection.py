"""
City Detection Module

Detects and normalizes city names from user input.
Supports common aliases and variations.
"""

import re
from typing import Optional, List, Tuple

# City aliases mapping: common names -> canonical name
CITY_ALIASES = {
    # India
    'mumbai': 'Mumbai',
    'bombay': 'Mumbai',
    'delhi': 'Delhi',
    'new delhi': 'Delhi',
    'bangalore': 'Bangalore',
    'bengaluru': 'Bangalore',
    'hyderabad': 'Hyderabad',
    'kolkata': 'Kolkata',
    'calcutta': 'Kolkata',
    'pune': 'Pune',
    'ahmedabad': 'Ahmedabad',
    'jaipur': 'Jaipur',
    'lucknow': 'Lucknow',
    'kanpur': 'Kanpur',
    'nagpur': 'Nagpur',
    'indore': 'Indore',
    'thane': 'Thane',
    'bhopal': 'Bhopal',
    'visakhapatnam': 'Visakhapatnam',
    'pimpri-chinchwad': 'Pimpri-Chinchwad',
    'patna': 'Patna',
    'vadodara': 'Vadodara',
    'ghaziabad': 'Ghaziabad',
    'ludhiana': 'Ludhiana',
    'srinagar': 'Srinagar',
    'surat': 'Surat',
    'kochi': 'Kochi',
    'cochin': 'Kochi',
    'gurgaon': 'Gurgaon',
    'gurugram': 'Gurgaon',
    'noida': 'Noida',
    'goa': 'Goa',
    'panaji': 'Goa',

    # USA
    'nyc': 'New York',
    'new york': 'New York',
    'los angeles': 'Los Angeles',
    'la': 'Los Angeles',
    'san francisco': 'San Francisco',
    'sf': 'San Francisco',
    'chicago': 'Chicago',
    'houston': 'Houston',
    'phoenix': 'Phoenix',
    'philadelphia': 'Philadelphia',
    'san antonio': 'San Antonio',
    'san diego': 'San Diego',
    'dallas': 'Dallas',
    'san jose': 'San Jose',
    'austin': 'Austin',
    'jacksonville': 'Jacksonville',
    'miami': 'Miami',
    'boston': 'Boston',
    'seattle': 'Seattle',
    'denver': 'Denver',
    'washington': 'Washington DC',
    'dc': 'Washington DC',
    'atlanta': 'Atlanta',
    'portland': 'Portland',
    'minneapolis': 'Minneapolis',
    'detroit': 'Detroit',
    'las vegas': 'Las Vegas',
    'orlando': 'Orlando',

    # UK
    'london': 'London',
    'manchester': 'Manchester',
    'birmingham': 'Birmingham',
    'leeds': 'Leeds',
    'bristol': 'Bristol',
    'edinburgh': 'Edinburgh',
    'glasgow': 'Glasgow',
    'liverpool': 'Liverpool',
    'newcastle': 'Newcastle',
    'belfast': 'Belfast',

    # Europe
    'paris': 'Paris',
    'berlin': 'Berlin',
    'madrid': 'Madrid',
    'barcelona': 'Barcelona',
    'rome': 'Rome',
    'milan': 'Milan',
    'amsterdam': 'Amsterdam',
    'vienna': 'Vienna',
    'prague': 'Prague',
    'warsaw': 'Warsaw',
    'moscow': 'Moscow',
    'istanbul': 'Istanbul',
    'athens': 'Athens',
    'zurich': 'Zurich',
    'geneva': 'Geneva',
    'lisbon': 'Lisbon',
    'dublin': 'Dublin',
    'stockholm': 'Stockholm',
    'copenhagen': 'Copenhagen',
    'oslo': 'Oslo',
    'helsinki': 'Helsinki',
    'budapest': 'Budapest',
    'bucharest': 'Bucharest',

    # Asia
    'tokyo': 'Tokyo',
    'osaka': 'Osaka',
    'bangkok': 'Bangkok',
    'singapore': 'Singapore',
    'hong kong': 'Hong Kong',
    'shanghai': 'Shanghai',
    'beijing': 'Beijing',
    'seoul': 'Seoul',
    'hong kong': 'Hong Kong',
    'kuala lumpur': 'Kuala Lumpur',
    'dubai': 'Dubai',
    'abu dhabi': 'Abu Dhabi',
    'doha': 'Doha',
    'riyadh': 'Riyadh',
    'beirut': 'Beirut',
    'tel aviv': 'Tel Aviv',
    'bangkok': 'Bangkok',

    # Australia
    'sydney': 'Sydney',
    'melbourne': 'Melbourne',
    'brisbane': 'Brisbane',
    'perth': 'Perth',
    'adelaide': 'Adelaide',
    'hobart': 'Hobart',
    'canberra': 'Canberra',

    # Canada
    'toronto': 'Toronto',
    'vancouver': 'Vancouver',
    'montreal': 'Montreal',
    'calgary': 'Calgary',
    'ottawa': 'Ottawa',
    'edmonton': 'Edmonton',
    'winnipeg': 'Winnipeg',
    'quebec': 'Quebec City',

    # Africa
    'cairo': 'Cairo',
    'johannesburg': 'Johannesburg',
    'lagos': 'Lagos',
    'cape town': 'Cape Town',
    'nairobi': 'Nairobi',

    # South America
    'sao paulo': 'São Paulo',
    'buenos aires': 'Buenos Aires',
    'lima': 'Lima',
    'bogota': 'Bogotá',
}


def detect_cities_in_text(text: str) -> List[str]:
    """
    Detect city names mentioned in user text.

    Args:
        text (str): User input text

    Returns:
        List[str]: List of detected canonical city names
    """

    if not text:
        return []

    text_lower = text.lower()
    detected_cities = []

    # Search for each alias in the text
    for alias, canonical in CITY_ALIASES.items():
        # Use word boundaries to avoid partial matches
        # e.g., don't match "band" in "bangalore"
        pattern = r'\b' + re.escape(alias) + r'\b'
        if re.search(pattern, text_lower):
            if canonical not in detected_cities:
                detected_cities.append(canonical)

    return detected_cities


def normalize_city_name(city_name: str) -> Optional[str]:
    """
    Normalize a city name to its canonical form.

    Args:
        city_name (str): City name (raw input)

    Returns:
        Optional[str]: Canonical city name or None if not recognized
    """

    if not city_name:
        return None

    city_lower = city_name.strip().lower()

    # Direct lookup in aliases
    if city_lower in CITY_ALIASES:
        return CITY_ALIASES[city_lower]

    # Try to find partial matches (e.g., "san fran" -> "San Francisco")
    for alias, canonical in CITY_ALIASES.items():
        if city_lower in alias or alias in city_lower:
            return canonical

    # If no match found, return the original with title case
    # (it might be a valid city not in our aliases)
    return city_name.title()


def extract_city_and_question(text: str, current_city: str) -> Tuple[Optional[str], str, bool]:
    """
    Extract the city being asked about and the question without city reference.

    Args:
        text (str): User input
        current_city (str): Currently loaded city on dashboard

    Returns:
        Tuple[Optional[str], str, bool]: (city_to_query, clean_question, is_comparison)
    """

    cities = detect_cities_in_text(text)

    # Check if this is a comparison question
    is_comparison = len(cities) > 1 or bool(re.search(r'(compare|vs|versus|between|difference)', text.lower()))

    if not cities:
        # No city mentioned, use current city
        return None, text, False

    if len(cities) == 1:
        # Single city mentioned
        city = cities[0]
        if city.lower() == current_city.lower():
            # Same as current, no need to fetch
            return None, text, False
        else:
            # Different city, need to fetch
            return city, text, False

    # Multiple cities (comparison)
    return cities, text, is_comparison


def is_followup_question(
    current_question: str,
    previous_question: Optional[str],
    last_detected_city: Optional[str]
) -> bool:
    """
    Determine if current question is a follow-up to previous.

    Examples:
        Previous: "Weather in Mumbai"
        Current: "What about tomorrow?"
        → True (continue with Mumbai)

    Args:
        current_question (str): Current user question
        previous_question (Optional[str]): Previous question
        last_detected_city (Optional[str]): Last city mentioned in conversation

    Returns:
        bool: True if this is a follow-up
    """

    if not previous_question or not last_detected_city:
        return False

    # Check if current question contains city names
    current_cities = detect_cities_in_text(current_question)

    # If user mentioned no new cities, it's likely a follow-up
    if not current_cities:
        # Check for follow-up keywords
        followup_keywords = [
            'what about',
            'and',
            'tomorrow',
            'next',
            'week',
            'weekend',
            'today',
            'tonight',
            'later',
            'now',
            'tell me',
            'more',
            'also',
        ]

        question_lower = current_question.lower()
        is_followup = any(keyword in question_lower for keyword in followup_keywords)

        return is_followup

    return False
