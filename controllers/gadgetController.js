import driver from "../db/connect.js";

const FETCH_GADGETS_QUERY = `
MATCH (m:Mobiles)
RETURN m AS gadget, 'Mobiles' AS category
ORDER BY RAND()
LIMIT 5
UNION ALL
MATCH (t:Tablets)
RETURN t AS gadget, 'Tablets' AS category
ORDER BY RAND()
LIMIT 5
UNION ALL
MATCH (l:Wearables)
RETURN l AS gadget, 'Wearables' AS category
ORDER BY RAND()
LIMIT 5
UNION ALL
MATCH (l:Headphones)
RETURN l AS gadget, 'Headphones' AS category
ORDER BY RAND()
LIMIT 5
UNION ALL
MATCH (l:Consoles)
RETURN l AS gadget, 'Consoles' AS category
ORDER BY RAND()
LIMIT 5
UNION ALL
MATCH (l:Cameras)
RETURN l AS gadget, 'Cameras' AS category
ORDER BY RAND()
LIMIT 5
UNION ALL
MATCH (l:Laptops)
RETURN l AS gadget, 'Laptops' AS category
ORDER BY RAND()
LIMIT 5
UNION ALL
MATCH (l:Televisions)
RETURN l AS gadget, 'Televisions' AS category
ORDER BY RAND()
LIMIT 5
`;

const gadgets = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(FETCH_GADGETS_QUERY);
    const gadgets = result.records.map((record) => ({
      gadget: record.get("gadget").properties,
      category: record.get("category"),
    }));
    res.json(gadgets);
  } catch (error) {
    console.error("Error retrieving gadgets:", error);
    res.status(500).send("Error retrieving gadgets");
  }
};

//fetch mobiles
const getMobiles = async (req, res) => {
  const FETCH_MOBILE_QUERY = `
MATCH (n:Mobiles) RETURN n
ORDER BY RAND()
LIMIT 50;
`;
  const session = driver.session();
  try {
    //const page = parseInt(req.query.page) || 1;
    //const limit = parseInt(req.query.limit) || 20; // Convert limit to integer
    //const skip = parseInt((page - 1) * limit);
    const result = await session.run(FETCH_MOBILE_QUERY);

    const mobiles = result.records.map((record) => record.get("n").properties);

    res.json(mobiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await session.close();
  }
};

const getProductsByCategory = async (req, res) => {
  const category = req.params.category;
  const FETCH_PRODUCTS_QUERY = `
    MATCH (p:${category})
    RETURN p, '${category}' AS category
    ORDER BY RAND()
    LIMIT 25;
  `;
  const session = driver.session();
  try {
    const result = await session.run(FETCH_PRODUCTS_QUERY);

    const products = result.records.map((record) => ({
      gadget: record.get("p").properties,
      category: record.get("category"),
    }));

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await session.close();
  }
};


//fetch by brand name
const byBrand = async (req, res) => {
  const session = driver.session();
  const brandName = req.params.brandName;

  const query = `
  MATCH (p)
WHERE (p:Mobiles OR p:Headphones OR p:Wearables OR p:Tablets OR p:Consoles OR p:Laptops OR p:Tablets OR p:Cameras)
AND p.Brand = $brandName
RETURN p
ORDER BY RAND()
LIMIT 50
  `;

  try {
    const result = await session.run(query, { brandName });
    const mobiles = result.records.map((record) => record.get("p").properties);
    res.json(mobiles);
  } catch (error) {
    console.error("Error fetching mobiles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//fetch by brand and category
const getProducts = async (req, res) => {
  const session = driver.session();
  let { category, brand } = req.params;
  category = category.charAt(0).toUpperCase() + category.slice(1);

  const query = `
    MATCH (p:${category})
    WHERE p.Brand = $brand
    RETURN p
    LIMIT 20
  `;

  try {
    const result = await session.run(query, { brand: brand });
    const products = result.records.map((record) => record.get("p").properties);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSingleProduct = async (req, res) => {
  const session = driver.session();
  const { category, productName } = req.params;

  const query = `
    MATCH (p:${category})
    WHERE p.\`Product Name\` = $productName
    RETURN p
    LIMIT 1
  `;
  try {
    const result = await session.run(query, { productName });
    if (result.records.length === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    const product = result.records[0].get("p").properties;
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
};

export { gadgets, getMobiles, byBrand, getProducts, getSingleProduct, getProductsByCategory };

