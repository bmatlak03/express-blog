//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { truncate } = require("lodash");
const { connect, Schema, model } = require("mongoose");
const {
  homeStartingContent,
  aboutContent,
  contactContent,
} = require("./constants/Content");
const PORT = 3002;
const app = express();

const MONGO_URL = "mongodb://127.0.0.1:27017/postsDB";

connect(MONGO_URL);

const postSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Post = model("Post", postSchema);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  Post.find((err, posts) => {
    if (err) return console.log(err);
    res.render("home", {
      content: homeStartingContent,
      posts: posts.map((post) => ({
        id: post._id,
        title: post.title,
        content: truncate(post.content, {
          length: 100,
        }),
      })),
    });
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    content: aboutContent,
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    content: contactContent,
  });
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", async (req, res) => {
  const { postTitle, postContent } = req.body;
  const postData = {
    title: postTitle,
    content: postContent,
  };
  const postToSet = new Post(postData);
  await postToSet.save();
  res.redirect("/");
});

app.get("/posts/:id", async (req, res) => {
  const idToFind = req.params.id;
  const foundPost = await Post.findById(idToFind);
  console.log(foundPost);
  if (foundPost) {
    res.render("post", foundPost);
  }
});

app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});
