const PORT = 8800;
const express = require("express");

const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

dotenv.config();

mongoose.connect(process.env.MONGO_URL, () => {
  console.log("mongoose connected");
});

app.use("/images", express.static(path.join(__dirname, "public/images")));

//middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(
  cors({
    origin: "*",
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
    console.log(file);
  },
});
const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfuly.");
  } catch (err) {
    console.log(err);
  }
});

//routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(PORT, () => {
  console.log("server is running on ", PORT);
});
