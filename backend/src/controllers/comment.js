const Comment = require("../models/comment.js");

const createComment = async (req, res, next) => {
  try {
    const { parentId, author, message } = req.body;

    if (!author || !message) {
      return res.status(400).json({
        message: "author and message are required",
      });
    }

    // Root comment
    if (!parentId) {
      const comment = await Comment.create({
        author,
        message,
        parentId: null,
      });

      return res.status(201).json(comment);
    }

    const parent = await Comment.findById(parentId);

    if (!parent) {
      return res.status(404).json({
        message: "Parent comment not found",
      });
    }

    // Check depth
    let depth = 1;
    let current = parent;

    while (current.parentId) {
      current = await Comment.findById(current.parentId);

      if (!current) {
        break;
      }

      depth++;
    }

    if (depth >= 5) {
      return res.status(400).json({
        message: "Maximum nesting depth of 5 reached",
      });
    }

    const comment = await Comment.create({
      parentId,
      author,
      message,
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// get all comments
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find().sort({
      createdAt: 1,
    });

    // Convert flat comments into tree
    const map = {};
    const roots = [];

    comments.forEach((comment) => {
      map[comment._id] = {
        ...comment.toObject(),
        replies: [],
      };
    });

    comments.forEach((comment) => {
      if (comment.parentId) {
        const parent = map[comment.parentId];

        if (parent) {
          parent.replies.push(map[comment._id]);
        }
      } else {
        roots.push(map[comment._id]);
      }
    });

    // Add descendant count
    const addCount = (comment) => {
      let count = 0;

      for (const reply of comment.replies) {
        count += 1;
        count += addCount(reply);
      }

      comment.descendantCount = count;

      return count;
    };

    roots.forEach(addCount);

    res.json(roots);
  } catch (error) {
    next(error);
  }
};

// update comment
const updateComment = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "message is required",
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.isDeleted) {
      return res.status(400).json({
        message: "Deleted comment cannot be edited",
      });
    }

    comment.message = message;

    await comment.save();

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// Delete comment
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    comment.isDeleted = true;
    comment.message = "This comment has been deleted";

    await comment.save();

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
