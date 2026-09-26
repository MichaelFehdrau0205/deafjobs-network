// Well-known cities and where each one is (a US state, or a country), so
// someone can type "Boston" and get "Boston, MA", or "Paris" and get
// "Paris, France". US cities whose name is shared with another well-known US
// city ("Springfield", "Portland", "Columbus", "Charleston") are left out on
// purpose, so nothing is guessed wrongly. For those, and for any city not in
// the list, the state list next to the box is used instead. A famous city
// abroad wins over a small US town of the same name (Paris is Paris, France).
const CITIES: [string, string][] = [
  // New York, New Jersey, Connecticut
  ["New York City", "NY"], ["Brooklyn", "NY"], ["Queens", "NY"], ["The Bronx", "NY"],
  ["Manhattan", "NY"], ["Staten Island", "NY"], ["Long Island City", "NY"], ["Yonkers", "NY"],
  ["White Plains", "NY"], ["Buffalo", "NY"], ["Albany", "NY"], ["Syracuse", "NY"],
  ["Newark", "NJ"], ["Jersey City", "NJ"], ["Hoboken", "NJ"], ["Paterson", "NJ"],
  ["Elizabeth", "NJ"], ["Trenton", "NJ"], ["Princeton", "NJ"],
  ["Stamford", "CT"], ["Hartford", "CT"], ["New Haven", "CT"], ["Bridgeport", "CT"],
  // Northeast and mid-Atlantic
  ["Boston", "MA"], ["Worcester", "MA"], ["Providence", "RI"], ["Philadelphia", "PA"],
  ["Pittsburgh", "PA"], ["Baltimore", "MD"], ["Virginia Beach", "VA"], ["Norfolk", "VA"],
  // South
  ["Atlanta", "GA"], ["Miami", "FL"], ["Orlando", "FL"], ["Tampa", "FL"], ["Jacksonville", "FL"],
  ["Charlotte", "NC"], ["Raleigh", "NC"], ["Nashville", "TN"], ["Memphis", "TN"],
  ["Birmingham", "AL"], ["New Orleans", "LA"], ["Baton Rouge", "LA"], ["Louisville", "KY"],
  ["Little Rock", "AR"], ["Oklahoma City", "OK"],
  // Midwest
  ["Chicago", "IL"], ["Detroit", "MI"], ["Indianapolis", "IN"], ["Cleveland", "OH"],
  ["Cincinnati", "OH"], ["Milwaukee", "WI"], ["Madison", "WI"], ["Minneapolis", "MN"],
  ["St. Louis", "MO"], ["Omaha", "NE"], ["Des Moines", "IA"],
  // Texas and the Southwest
  ["Dallas", "TX"], ["Fort Worth", "TX"], ["Houston", "TX"], ["Austin", "TX"],
  ["San Antonio", "TX"], ["El Paso", "TX"], ["Phoenix", "AZ"], ["Tucson", "AZ"],
  ["Albuquerque", "NM"], ["Las Vegas", "NV"],
  // West
  ["Denver", "CO"], ["Salt Lake City", "UT"], ["Boise", "ID"], ["Seattle", "WA"],
  ["Los Angeles", "CA"], ["San Francisco", "CA"], ["San Diego", "CA"], ["San Jose", "CA"],
  ["Oakland", "CA"], ["Sacramento", "CA"], ["Honolulu", "HI"], ["Anchorage", "AK"],
  // Canada and Mexico
  ["Toronto", "Canada"], ["Vancouver", "Canada"], ["Montreal", "Canada"], ["Ottawa", "Canada"],
  ["Calgary", "Canada"], ["Mexico City", "Mexico"], ["Guadalajara", "Mexico"], ["Cancun", "Mexico"],
  // Europe
  ["Paris", "France"], ["London", "UK"], ["Dublin", "Ireland"], ["Berlin", "Germany"],
  ["Munich", "Germany"], ["Madrid", "Spain"], ["Barcelona", "Spain"], ["Lisbon", "Portugal"],
  ["Rome", "Italy"], ["Milan", "Italy"], ["Amsterdam", "Netherlands"], ["Brussels", "Belgium"],
  ["Zurich", "Switzerland"], ["Vienna", "Austria"], ["Prague", "Czechia"], ["Warsaw", "Poland"],
  ["Stockholm", "Sweden"], ["Copenhagen", "Denmark"], ["Oslo", "Norway"], ["Helsinki", "Finland"],
  ["Athens", "Greece"], ["Istanbul", "Turkey"], ["Moscow", "Russia"],
  // Asia and the Middle East
  ["Tokyo", "Japan"], ["Seoul", "South Korea"], ["Beijing", "China"], ["Shanghai", "China"],
  ["Hong Kong", "China"], ["Taipei", "Taiwan"], ["Singapore", "Singapore"], ["Bangkok", "Thailand"],
  ["Manila", "Philippines"], ["Jakarta", "Indonesia"], ["Kuala Lumpur", "Malaysia"],
  ["Mumbai", "India"], ["New Delhi", "India"], ["Bangalore", "India"], ["Dubai", "UAE"],
  ["Tel Aviv", "Israel"],
  // Africa
  ["Cairo", "Egypt"], ["Lagos", "Nigeria"], ["Nairobi", "Kenya"], ["Johannesburg", "South Africa"],
  ["Cape Town", "South Africa"],
  // South America and Australia
  ["S\u00e3o Paulo", "Brazil"], ["Rio de Janeiro", "Brazil"], ["Buenos Aires", "Argentina"],
  ["Bogot\u00e1", "Colombia"], ["Lima", "Peru"], ["Santiago", "Chile"],
  ["Sydney", "Australia"], ["Melbourne", "Australia"], ["Auckland", "New Zealand"],
];

// Other ways people type the same place.
const ALIASES: Record<string, string> = {
  nyc: "New York City",
  "new york": "New York City",
  "new york city": "New York City",
  bronx: "The Bronx",
  "the bronx": "The Bronx",
  "saint louis": "St. Louis",
  "st louis": "St. Louis",
  "st. louis": "St. Louis",
  philly: "Philadelphia",
  sf: "San Francisco",
  la: "Los Angeles",
  delhi: "New Delhi",
  bombay: "Mumbai",
  "sao paulo": "S\u00e3o Paulo",
  bogota: "Bogot\u00e1",
  rio: "Rio de Janeiro",
  "mexico city": "Mexico City",
  "hong kong": "Hong Kong",
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

const BY_NAME = new Map<string, { name: string; region: string }>();
for (const [name, region] of CITIES) BY_NAME.set(norm(name), { name, region });

// "boston" -> { name: "Boston", region: "MA" }; "paris" -> { name: "Paris", region: "France" }. Returns null for a city that
// isn't in the list (or is shared by several states), so the caller leaves it
// as typed and the person picks the state from the list.
export function lookupCity(typed: string): { name: string; region: string } | null {
  const key = norm(typed);
  const aliased = ALIASES[key];
  return BY_NAME.get(aliased ? norm(aliased) : key) ?? null;
}
