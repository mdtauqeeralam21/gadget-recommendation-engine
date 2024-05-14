import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const neo4jUri = process.env.NEO4J_URI;
const neo4jUser = process.env.NEO4J_USER;
const neo4jPassword = process.env.NEO4J_PASSWORD;

if (!neo4jUri || !neo4jUser || !neo4jPassword) {
  console.error("One or more Neo4j environment variables are missing.");
  process.exit(1);
}

const driver = neo4j.driver(
  neo4jUri,
  neo4j.auth.basic(neo4jUser, neo4jPassword)
);

export default driver;
