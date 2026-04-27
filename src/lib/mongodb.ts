import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGO_URI!;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let isConnected = false;

export async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log('Connected to MongoDB!');
  }
  return client.db("cdm_obe");
}