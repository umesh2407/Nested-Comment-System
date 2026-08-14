const express = require("express");

const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.js");

const router = express.Router();

router.post("/", createComment);
router.get("/", getComments);
router.patch("/:id", updateComment);
router.delete("/:id", deleteComment);

module.exports = router;
