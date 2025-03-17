// src/scripts/migrate-organizations.js
// Run this script with: node -r dotenv/config src/scripts/migrate-organizations.js

const mongoose = require('mongoose');
const { MongoClient, ObjectId } = require('mongodb');

// This script will assign a default userId to existing organizations
// You'll need to run this if you already have data in your database

async function migrateOrganizations() {
  try {
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const organizationsCollection = db.collection('organizations');
    
    // Find all organizations without a userId
    const organizationsWithoutUserId = await organizationsCollection.find({ userId: { $exists: false } }).toArray();
    
    console.log(`Found ${organizationsWithoutUserId.length} organizations without userId`);
    
    if (organizationsWithoutUserId.length === 0) {
      console.log('No migration needed. All organizations have a userId.');
      await client.close();
      return;
    }
    
    // Get first user to assign as default owner
    const usersCollection = db.collection('users');
    const defaultUser = await usersCollection.findOne({});
    
    if (!defaultUser) {
      throw new Error('No users found in the database. Create a user first.');
    }
    
    console.log(`Using user ${defaultUser.email} (${defaultUser._id}) as the default owner`);
    
    // Update all organizations without a userId
    const updateResult = await organizationsCollection.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: defaultUser._id } }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} organizations`);
    
    await client.close();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateOrganizations().then(() => process.exit(0));