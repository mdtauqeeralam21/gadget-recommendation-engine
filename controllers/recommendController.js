import driver from "../db/connect.js";


const recordInteraction = async (req, res) => {
  const userId = req.user.userId;
  const { url, category } = req.body;

  if (!url || !category) {
    return res.status(400).send("URL and category are required.");
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `
        MATCH (user:User {id: $userId})
        MATCH (product:${category} {url: $url})
        CREATE (user)-[:INTERACTED_WITH {action: "interacted"}]->(product)
      `,
      { userId, url, category }
    );

    console.log("Interaction recorded successfully.");
    res.status(200).send("Interaction recorded successfully.");
  } catch (error) {
    console.error("Error recording interaction:", error);
    res.status(500).send("Error recording interaction.");
  } finally {
    session.close();
  }
};


//=================================================================================================
const similarProducts = async (req, res) => {
  const { userId } = req.user;

  if (!userId) {
    return res
      .status(400)
      .send("User ID is required in the request.");
  }

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1)
      MATCH (p1)-[:SIMILAR_TO]->(gadget)
      RETURN gadget, p1 AS category
      ORDER BY RAND()
      LIMIT 12
      `,
      { userId }
    );

    const gadgets = result.records.map((record) => ({
      gadget: record.get("gadget").properties,
      category: record.get("category").labels[0]
    }));

    res.json(gadgets);
  } catch (error) {
    console.error(`Error getting similar products`, error);
    res.status(500).send(`Error getting similar products.`);
  } finally {
    session.close();
  }
};

//================================================================================================
const recommendations = async (req, res) => {
  const { userId } = req.user;
  const { category } = req.body;

  if (!userId || !category) {
    return res
      .status(400)
      .send("User ID and category are required in the request.");
  }

  const session = driver.session();
  try {
    let cypherQuery;

    if (category === "Mobiles") {
      cypherQuery = `
        MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1:Mobiles)
        WITH user, interacts, p1
        MATCH (p2:Mobiles)
        WHERE p1.Brand = p2.Brand
          AND p1.RAM = p2.RAM
          AND p1.\`Internal storage\` = p2.\`Internal storage\`
          AND p1.url <> p2.url
        MERGE (p1)-[:SIMILAR_TO]->(p2)
        WITH user, interacts, p1, p2
        MATCH (p1)-[:SIMILAR_TO]->(similarProduct:Mobiles)
        RETURN  p1, similarProduct,'Mobiles' AS category
        ORDER BY RAND()
        LIMIT 10
      `;
    } else if (category === "Laptops") {
      cypherQuery = `
      MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1:Laptops)
      WITH user, interacts, p1
      MATCH (p2:Laptops)
      WHERE p1.Brand = p2.Brand
        AND p1.RAM = p2.RAM
        AND p1.\`Internal storage\` = p2.\`Internal storage\`
        AND p1.Size = p2.Size
        AND p1.url <> p2.url
      MERGE (p1)-[:SIMILAR_TO]->(p2)
      WITH user, interacts, p1, p2
      MATCH (p1)-[:SIMILAR_TO]->(similarProduct:Laptops)
      RETURN  p1, similarProduct,'Laptops' AS category
      ORDER BY RAND()
      LIMIT 10
      
      `;
    }else if (category === "Wearables") {
      cypherQuery = `
      MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1:Wearables)
      WITH user, interacts, p1
      MATCH (p2:Wearables)
      WHERE p1.Brand = p2.Brand
        AND p1.\`Dial Shape\` = p2.\`Dial Shape\`
        AND p1.\`Strap Material\` = p2.\`Strap Material\`
        AND p1.\`Ideal For\`=p2.\`Ideal For\`
        AND p1.url <> p2.url
      MERGE (p1)-[:SIMILAR_TO]->(p2)
      WITH user, interacts, p1, p2
      MATCH (p1)-[:SIMILAR_TO]->(similarProduct:Wearables)
      RETURN  p1, similarProduct,'Wearables' AS category
      ORDER BY RAND()
      LIMIT 10
      
      `;
    }
    else if (category === "Headphones") {
      cypherQuery = `
      MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1:Headphones)
      WITH user, interacts, p1
      MATCH (p2:Headphones)
      WHERE p1.Brand = p2.Brand
        AND p1.Connectivity = p2.Connectivity
        AND p1.Colour = p2.Colour
        AND p1.Type = p2.Type
        AND p1.url <> p2.url
      MERGE (p1)-[:SIMILAR_TO]->(p2)
      WITH user, interacts, p1, p2
      MATCH (p1)-[:SIMILAR_TO]->(similarProduct:Headphones)
      RETURN p1, similarProduct,'Headphones' AS category
      ORDER BY RAND()
      LIMIT 10
      
      `;
    } else if (category === "Cameras") {
      cypherQuery = `
      MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1:Cameras)
      WITH user, interacts, p1
      MATCH (p2:Cameras)
      WHERE p1.Brand = p2.Brand
        AND p1.Color = p2.Color
        AND p1.\`Display Size\`= p2.\`Display Size\`
        AND p1.url <> p2.url
      MERGE (p1)-[:SIMILAR_TO]->(p2)
      WITH user, interacts, p1, p2
      MATCH (p1)-[:SIMILAR_TO]->(similarProduct:Cameras)
      RETURN p1, similarProduct,'Cameras' AS category
      ORDER BY RAND()
      LIMIT 10
      
      `;
    } else if (category === "Tablets") {
      cypherQuery = `
      MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1:Tablets)
      WITH user, interacts, p1
      MATCH (p2:Tablets)
      WHERE p1.Brand = p2.Brand
        AND p1.RAM = p2.RAM
        AND p1.\`Internal storage\`= p2.\`Internal storage\`
        AND p1.url <> p2.url
      MERGE (p1)-[:SIMILAR_TO]->(p2)
      WITH user, interacts, p1, p2
      MATCH (p1)-[:SIMILAR_TO]->(similarProduct:Tablets)
      RETURN p1, similarProduct,'Tablets' AS category
      ORDER BY RAND()
      LIMIT 10
      
      `;
    } else if (category === "Consoles") {
      cypherQuery = `
      MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1:Consoles)
      WITH user, interacts, p1
      MATCH (p2:Consoles)
      WHERE p1.Brand = p2.Brand
        AND p1.\`Console Type\` = p2.\`Console Type\`
        AND p1.url <> p2.url
      MERGE (p1)-[:SIMILAR_TO]->(p2)
      WITH user, interacts, p1, p2
      MATCH (p1)-[:SIMILAR_TO]->(similarProduct:Consoles)
      RETURN p1, similarProduct,'Consoles' AS category
      ORDER BY RAND()
      LIMIT 10
      
      `;
    } else if (category === "Televisions") {
      cypherQuery = `
      MATCH (user:User {id: $userId})-[interacts:INTERACTED_WITH]->(p1:Televisions)
      WITH user, interacts, p1
      MATCH (p2:Televisions)
      WHERE p1.Brand = p2.Brand
        AND p1.\`Display Size\`= p2.\`Display Size\`
        AND p1.\`Resolution Standard\` = p2.\`Resolution Standard\`
        AND p1.\`Resolution (pixels)\` = p2.\`Resolution (pixels)\`
        AND p1.url <> p2.url
      MERGE (p1)-[:SIMILAR_TO]->(p2)
      WITH user, interacts, p1, p2
      MATCH (p1)-[:SIMILAR_TO]->(similarProduct:Televisions)
      RETURN p1, similarProduct,'Televisions' AS category
      ORDER BY RAND()
      LIMIT 10      
      `;
    } else {
      return res.status(400).send("Invalid category provided.");
    }

    const result = await session.run(cypherQuery, { userId });

    const recommendations = result.records.map((record) => ({
      category:record.get("category"),
      similarProduct: record.get("similarProduct").properties,
    }));

    res.json(recommendations);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).send("Error getting recommendations.");
  } finally {
    session.close();
  }
};


export { recordInteraction, recommendations, similarProducts };
