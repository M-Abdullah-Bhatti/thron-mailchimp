const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./usermodel");

// Middlewares
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: false }));
// app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());

const corsOptions = {
  origin: true,
  // origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ----------------------------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDB();

// ---------------------------------

// Requests
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/home.html");
});

app.get("/form", function (req, res) {
  res.sendFile(__dirname + "/public/form.html");
});

// Mailchimp Post Requests
app.post("/form", async function (req, res) {
  const { email, password } = req.body;

  // ===============================
  let link = "https://api.ipify.org";
  let response = await axios.get(link);
  console.log("response" + response);

  let ipAddress = await response.data;
  console.log("FetchedLocation ip " + ipAddress);

  let link2 = `https://ip.city/api.php?ip=${ipAddress}&key=${process.env.IPCITY_API}`;
  let location = await axios.get(link2);
  let loc = await location.data;
  // ===============================

  try {
    const newUser = new User({
      email,
      password,
      location: `IP: ${ipAddress} , Country: ${loc.countryName} , Region: ${loc.region}, City: ${loc.city} `,
    });

    const savedUser = await newUser.save();
    res.redirect("/form");
    // res.status(200).json({ message: "User saved successfully", savedUser });
  } catch (error) {
    res.redirect("/form");
    // console.log(error);
    // res.status(500).json({ message: "Error saving user" });
  }
});

// Server Listening
app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
