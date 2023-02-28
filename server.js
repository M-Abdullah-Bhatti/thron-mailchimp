const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const axios = require("axios");
require("dotenv").config();

// Middlewares
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Requests
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/home.html");
});

app.get("/form", function (req, res) {
  res.sendFile(__dirname + "/public/form.html");
});

// Mailchimp Post Requests
app.post("/form", async function (req, res) {
  console.log("------------------------");

  let link = "https://api.ipify.org";
  let response = await axios.get(link);
  console.log("response" + response);

  let ipAddress = await response.data;
  console.log("FetchedLocation ip " + ipAddress);

  let link2 = `https://ip.city/api.php?ip=${ipAddress}&key=${process.env.IPCITY_API}`;
  let location = await axios.get(link2);
  let loc = await location.data;
  console.log("LOC------------------------" + loc);

  const email = req.body.email;
  const password = req.body.password;
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          _EMAIL: email,
          PASSWORD: password,
          LOCATION: `IP: ${ipAddress} , Country: ${loc.countryName} , Region: ${loc.region}, City: ${loc.city} `,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);

  // Credentials
  const AudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const ServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const ApiKey = process.env.MAILCHIMP_API_KEY;
  const url = `https://${ServerPrefix}.api.mailchimp.com/3.0/lists/${AudienceId}`;

  const options = {
    method: "POST",
    auth: `${process.env.USER_NAME}:${ApiKey}`,
  };

  const request = https.request(url, options, function (response) {
    response.on("data", function (data) {
      console.log(JSON.parse(data));
    });
  });
  request.write(jsonData);
  request.end();
  res.sendFile(__dirname + "/public/home.html");
  res.redirect("/form");
});

// Server Listening
app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
