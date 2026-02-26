const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Table = require('./models/Table');
const Menu = require('./models/Menu');

dotenv.config();

const clearDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error("No MONGODB_URI found in .env");
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for maintenance...");

    // Warning: This script is now for maintenance only.
    // Static data is managed via the Admin Panel.
    
    console.log("This script is currently inert. No static data was added.");
    console.log("Use the Admin Panel UI to manage your Restaurant data.");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

clearDB();
