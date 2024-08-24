import express from "express";
const { google } = require("googleapis");
import "dotenv/config";

const app = express();

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Define the scope of access for the Google calender API
const scopes = ["https://www.googleapis.com/auth/calendar"];

// OAuth 2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});

app.get("/auth/redirect", async (req, res) => {
  const { token } = await oauth2Client.getToken(req.query.code as string);
  oauth2Client.setCredentials(token);
  res.send("Authentication successful! Please return to the console.");
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
