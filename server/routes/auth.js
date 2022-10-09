const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//Register
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const existingUsername = await User.findOne({
      username: req.body.username,
    });
    const existingEmail = await User.findOne({ email: req.body.email });

    if (existingUsername) {
      res.status(400).json("user with this username already exists.");
    }
    if (existingEmail) {
      res.status(400).json("user with this email already exists");
    }
    if (req.body.password.length < 6) {
      res.status(400).json("password length should be more than 6 characters");
    }
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("wrong password");

    res.status(200).json(user);
  } catch (err) {
    // res.status(500).json(err);
    console.log(err);
  }
});

module.exports = router;
