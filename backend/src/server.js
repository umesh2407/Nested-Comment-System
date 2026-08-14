const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = require("./app");

dotenv.config();

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    console.log("Database connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server is running.....`, process.env.PORT);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
