import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error("MONGODB_URI is missing")
}

const dbName = process.env.DB_NAME || "hireloop"

const client = new MongoClient(uri)

let dbPromise: Promise<Db> | null = null

export const db = async (): Promise<Db> => {
  if (!dbPromise) {
    dbPromise = client
      .connect()
      .then(() => {
        console.log("MongoDB Connected Successfully")
        return client.db(dbName)
      })
      .catch((error) => {
        dbPromise = null
        throw error
      })
  }

  return dbPromise
}
