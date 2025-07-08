const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const fs = require("fs");

let latestPayload = {};

app.use(bodyParser.json());
app.use(express.static("public"));

// Webhook endpoint
app.post("/webhook", (req, res) => {
  const incomingPayload = req.body;

  const userFile = path.join(__dirname, "user.json");

  fs.readFile(userFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading user.json:", err);
      return res.status(500).send("Server error");
    }

    const user = JSON.parse(data);

    let verificationStatus = "Verified - Unknown";

    if (incomingPayload.uuid && user.uuid) {
      verificationStatus = (incomingPayload.uuid === user.uuid)
        ? "Verified - True"
        : "Verified - False";
    }

    latestPayload = {
      ...incomingPayload,
      verified: verificationStatus
    };

    console.log("Webhook received:", latestPayload);
    res.status(200).json(latestPayload);
  });
});


// Serve latest payload
app.get("/payload", (req, res) => {
  res.json(latestPayload);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// Serve user info
app.get("/user", (req, res) => {
  const userFile = path.join(__dirname, "user.json");
  fs.readFile(userFile, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading user info");
    res.type("application/json").send(data);
  });
});

//Clear endpoint data
app.post("/clear", (req, res) => {
  latestPayload = {};
  res.status(200).send("Payload cleared");
});
