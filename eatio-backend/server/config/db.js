// server/config/db.js

const mongoose = require('mongoose');

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Attempt to connect to the database using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log a success message to the console if the connection is established
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log any errors that occur during the connection attempt
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Exit the Node.js process with a failure code (1) if connection fails
    process.exit(1);
  }
};

// Export the connectDB function to be used in other parts of the application
module.exports = connectDB;
