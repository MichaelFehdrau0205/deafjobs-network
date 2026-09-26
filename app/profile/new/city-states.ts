// Well-known US cities and the state each one is in, so someone can type
// "Boston" and get "Boston, MA". Only cities whose name is not shared with a
// well-known city in another state are listed: "Springfield", "Portland",
// "Columbus" and "Charleston" are left out on purpose, so nothing is guessed
// wrongly. For those, the state list next to the box is used instead.
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
};

const norm = (s: string) => s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

const BY_NAME = new Map<string, { name: string; state: string }>();
for (const [name, state] of CITIES) BY_NAME.set(norm(name), { name, state });

// "boston" -> { name: "Boston", state: "MA" }. Returns null for a city that
// isn't in the list (or is shared by several states), so the caller leaves it
// as typed and the person picks the state from the list.
export function lookupCity(typed: string): { name: string; state: string } | null {
  const key = norm(typed);
  const aliased = ALIASES[key];
  return BY_NAME.get(aliased ? norm(aliased) : key) ?? null;
}
