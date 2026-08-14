const express = require("express");
const cors = require("cors");

const commentRoutes = require("./routes/comment.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/comments", commentRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
