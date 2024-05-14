import driver from "../db/connect.js";

const addToCart = async (req, res) => {
  const session = driver.session(); // Create a new session

  try {
    const userId = req.user.userId;
    const category = req.body.category;
    const productName = req.body.productName;
    const priceInIndia = req.body.priceInIndia;

    const result = await session.run(
      `
      MATCH (user:User {id: $userId})
      MATCH (p:${category} { \`Product Name\`: $productName, \`Price in India\`: $priceInIndia })
      MERGE (user)-[:ADDED_TO_CART]->(p)
      `,
      { userId, productName, priceInIndia }
    );

    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.close(); 
  }
};

const removeFromCart = async (req, res) => {
  const session = driver.session(); // Create a new session

  try {
    const userId = req.user.userId;
    const productName = req.body.productName;

    const result = await session.run(
      `
      MATCH (user:User {id: $userId})-[r:ADDED_TO_CART]->(p { \`Product Name\`: $productName })
      DELETE r
      `,
      { userId, productName }
    );

    if (result.summary.updateStatistics.relationshipsDeleted > 0) {
      res.status(200).json({ message: "Item removed from cart successfully" });
    } else {
      res.status(404).json({ error: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.close(); // Close the session
  }
};

const viewCart = async (req, res) => {
  const session = driver.session(); // Create a new session

  try {
    const userId = req.user.userId;

    const result = await session.run(
      `
      MATCH (user:User {id: $userId})-[:ADDED_TO_CART]->(product)
      RETURN product
      `,
      { userId }
    );

    const cartItems = result.records.map(
      (record) => record.get("product").properties
    );

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error("Error retrieving user cart:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.close(); // Close the session
  }
};

export { addToCart, removeFromCart, viewCart };
