import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'section_builder';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// DEBUG: Log a masked version of the URI to check format
if (MONGODB_URI) {
    const masked = MONGODB_URI.replace(/:([^@]+)@/, ":****@");
    console.log("Attempting to connect to MongoDB with URI:", masked);
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

// Helper to get sections collection
export async function getSectionsCollection() {
    const { db } = await connectToDatabase();
    return db.collection('sections');
}

// Helper to get users collection
export async function getUsersCollection() {
    const { db } = await connectToDatabase();
    return db.collection('users');
}
