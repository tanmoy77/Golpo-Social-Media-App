const router = require("express").Router();
const { response } = require("express");
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (req.body.userId === post.userId) {
      const updatedPost = await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated.");
    } else {
      return res
        .status(401)
        .json("You don't have permission to update this post.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.body.userId === post.userId) {
      await post.deleteOne();
      res.status(200).json("Your post has been deleted.");
    } else {
      return res
        .status(401)
        .json("You don't have permission to delete this post.");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

//like or dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json("You liked this post.");
      } else {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json("You disliked this post.");
      }
    } else {
      return res.status(404).json("Post not found.");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    return res.status(500).json(err);
  }
});

//get current user posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      const posts = await Post.find({ userId: user._id });
      res.status(200).json(posts);
    } else {
      res.status(404).json("user not found");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
