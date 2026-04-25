import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

let client;
let db;

function buildMongoUri() {
  const uriTemplate =
    process.env.MONGODB_URI_TEMPLATE ||
    process.env.MONGODB_URI ||
    process.env.database;

  if (!uriTemplate) {
    throw new Error("Missing Mongo URI. Set MONGODB_URI or database in .env.");
  }

  if (!uriTemplate.includes("<db_password>")) {
    return uriTemplate;
  }

  const password = process.env.DB_PASSWORD || process.env.db_password;

  if (!password) {
    throw new Error("Missing DB_PASSWORD in .env for <db_password> URI template.");
  }

  return uriTemplate.replace("<db_password>", encodeURIComponent(password));
}

export async function connect() {
  if (db) {
    return db;
  }

  const uri = buildMongoUri();
  const dbName = process.env.DB_NAME || "hunterhacks2026";

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function disconnect() {
  if (client) {
    await client.close();
  }

  client = undefined;
  db = undefined;
}
