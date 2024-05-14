import driver from "../db/connect.js";

const searchHistory = async (req, res) => {
  const session = driver.session();
  let searchBy = req.user.userId;
  try {
    const keyword = req.query.keyword;

    if (keyword) {
      await storeSearchHistory(keyword, searchBy);
    }

    const result = await session.run(
      `
        MATCH (p:Tablets) 
        WHERE toLower(p.\`Product Name\`) CONTAINS toLower($keyword)
        RETURN p AS product, 'Tablets' AS category
        LIMIT 5
        UNION
        MATCH (m:Mobiles) 
        WHERE toLower(m.\`Product Name\`) CONTAINS toLower($keyword)
        RETURN m AS product, 'Mobiles' AS category
        LIMIT 5
        UNION
        MATCH (w:Wearables) 
        WHERE toLower(w.\`Product Name\`) CONTAINS toLower($keyword)
        RETURN w AS product, 'Wearables' AS category
        LIMIT 5
        UNION
        MATCH (w:Headphones) 
        WHERE toLower(w.\`Product Name\`) CONTAINS toLower($keyword)
        RETURN w AS product, 'Headphones' AS category
        LIMIT 5
        UNION
        MATCH (w:Consoles) 
        WHERE toLower(w.\`Product Name\`) CONTAINS toLower($keyword)
        RETURN w AS product, 'Consoles' AS category
        LIMIT 5
        UNION
        MATCH (w:Laptops) 
        WHERE toLower(w.\`Product Name\`) CONTAINS toLower($keyword)
        RETURN w AS product, 'Laptops' AS category
        LIMIT 5
        UNION
        MATCH (w:Televisions) 
        WHERE toLower(w.\`Product Name\`) CONTAINS toLower($keyword)
        RETURN w AS product, 'Televisions' AS category
        LIMIT 5
        UNION
        MATCH (w:Cameras)
        WHERE toLower(w.\`Product Name\`) CONTAINS toLower($keyword)
        RETURN w AS product, 'Cameras' AS category
        LIMIT 5
      `,
      { keyword }
    );

    const products = result.records.map((record) => ({
      product: record.get("product").properties,
      category: record.get("category"),
    }));

    res.json(products);
  } catch (error) {
    console.error("Error performing search:", error);
    res.status(500).json({
      error: "An error occurred while performing the search",
    });
  } finally {
    await session.close();
  }
};

//==========================================================

const fetchSearchHistory = async (req, res) => {
  const userId = req.user.userId;
  const session = driver.session();

  try {
    const query = `
    MATCH (s:SearchHistory {searchBy: $userId})
    RETURN s
    ORDER BY s.createdAt DESC
    LIMIT 10
    
    `;

    const result = await session.run(query, { userId });
    const searchHistory = result.records.map(
      (record) => record.get("s").properties
    );
    res.json(searchHistory);
  } catch (error) {
    console.error("Error fetching search history:", error);
    res.status(500).send("Error fetching search history.");
  } finally {
    await session.close();
  }
};

//=============================================================
const storeSearchHistory = async (keyword, searchBy) => {
  const session = driver.session();

  try {
    const existingKeywordQuery = `
      MATCH (s:SearchHistory {searchBy: $searchBy, keyword: $keyword})
      RETURN COUNT(s) as count
    `;

    const existingKeywordResult = await session.run(existingKeywordQuery, { searchBy, keyword });
    const count = existingKeywordResult.records[0].get("count").toNumber();

    if (count === 0) {
      const query = `
        CREATE (s:SearchHistory { keyword: $keyword, searchBy: $searchBy, createdAt: timestamp() })
        RETURN s
      `;
  
      await session.run(query, { keyword, searchBy });
      console.log("Search history stored successfully");
    } else {
      console.log("Keyword already exists in the search history");
    }
  } catch (error) {
    console.error("Error storing search history:", error);
  } finally {
    await session.close();
  }
};

export { searchHistory, storeSearchHistory, fetchSearchHistory };
