const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const connection = mongoose.createConnection(
  process.env.MONGODB_CONNECTION_URI
);

let Post;

connection.once("open", () => {
  console.log("Connected to Database (Sightings API)");
  Post = require("../models/posts")(connection);
});

router.get("/recent", async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ status: "INTERNAL SERVER ERROR" });
  }
});

router.post("/add", async (req, res) => {
  const {
    date: dateString,
    description,
    timeZoneOffset: clientTimeZoneOffset,
    nickname,
  } = req.body;

  if (
    dateString === undefined ||
    description === undefined ||
    nickname === undefined
  ) {
    res.status(400).json({ message: "BAD REQUEST" });
    return;
  }

  // Store time in DB in UTC timezone
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  date.setMinutes(date.getMinutes() + clientTimeZoneOffset);

  const post = new Post({
    date,
    description,
    userNickname: nickname,
  });

  try {
    await post.save();
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ status: "INTERNAL SERVER ERROR" });
  }
});

module.exports = router;