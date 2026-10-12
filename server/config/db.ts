import mongoose from 'mongoose';

export interface DatabaseState {
  isConnected: boolean;
  isAtlas: boolean;
  statusText: string;
  host?: string;
  errorMessage?: string;
  mode: 'mongodb_atlas' | 'resilient_local_store';
}

export const dbState: DatabaseState = {
  isConnected: false,
  isAtlas: false,
  statusText: 'Initializing database...',
  mode: 'resilient_local_store',
};

export async function connectDatabase(): Promise<DatabaseState> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('MY_MONGODB_URI')) {
    dbState.isConnected = false;
    dbState.isAtlas = false;
    dbState.mode = 'resilient_local_store';
    dbState.statusText = 'MongoDB Atlas URI not yet configured in environment variables.';
    console.warn(
      '⚠️ [Crystal Rent Car] MONGODB_URI is not set or contains placeholder credentials. ' +
        'Running with resilient local storage adapter. Configure MONGODB_URI in .env to persist directly to MongoDB Atlas.'
    );
    return dbState;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    dbState.isConnected = true;
    dbState.isAtlas = true;
    dbState.mode = 'mongodb_atlas';
    dbState.host = conn.connection.host;
    dbState.statusText = `Connected to MongoDB Atlas (${conn.connection.host})`;
    console.log(`✅ [Crystal Rent Car] Connected to MongoDB Atlas at ${conn.connection.host}`);
    return dbState;
  } catch (error: any) {
    dbState.isConnected = false;
    dbState.isAtlas = false;
    dbState.mode = 'resilient_local_store';
    dbState.errorMessage = error?.message || 'Connection failed';
    dbState.statusText = `MongoDB Atlas connection error: ${dbState.errorMessage}. Resilient fallback active.`;
    console.error('❌ [Crystal Rent Car] MongoDB Atlas connection error:', error.message);
    return dbState;
  }
}

export function getDatabaseStatus(): DatabaseState {
  return {
    ...dbState,
    isConnected: mongoose.connection.readyState === 1 || dbState.mode === 'resilient_local_store',
  };
}
