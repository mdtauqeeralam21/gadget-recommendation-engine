//Example cypher queries

export const PURCHASE_QUERY = `
MATCH (user:User {name: "Kishan"})
MATCH (mobile:Mobiles {url: "https://gadgets.ndtv.com/samsung-galaxy-core-2-1738"})
CREATE (user)-[interaction:INTERACTED_WITH {action: "purchase"}]->(mobile)
`;

export const SIMILAR_MOBILE_QUERY_1 = `
MATCH (user:User {name: "Kishan"})-[interacts:INTERACTED_WITH]->(m1:Mobiles)
WITH user, interacts, m1
MATCH (m2:Mobiles)
WHERE m1.Brand = m2.Brand
  AND m1.RAM = m2.RAM
  AND m1.\`Internal storage\` = m2.\`Internal storage\`
  AND m1.url <> m2.url
MERGE (m1)-[:SIMILAR_TO]->(m2)
WITH user, interacts, m1, m2
MATCH (m1)-[:SIMILAR_TO]->(similarMobile:Mobiles)
RETURN user, interacts, similarMobile
LIMIT 20
`;

export const SIMILAR_MOBILE_QUERY_2 = `
MATCH (user:User {name: "Kishan"})-[interacts:INTERACTED_WITH]->(m1:Mobiles)
WITH user, m1
MATCH (m1)-[:SIMILAR_TO]->(similarMobile:Mobiles)
RETURN user, m1, similarMobile
LIMIT 25
`;
