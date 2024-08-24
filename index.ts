import express, { Response } from "express";
const { google } = require("googleapis");
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";

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
  const { tokens } = await oauth2Client.getToken(req.query.code);
  console.log({ tokens });
  oauth2Client.setCredentials(tokens);
  res.send("Authentication successful! Please return to the console.");
});

// * initialize The Google Calendar API
const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

const event = {
  summary: "Tech Talk with EL-Raghy",
  location: "Google Meet",

  description: "Demo event for EL-Raghy",
  start: {
    dateTime: "2024-09-09T09:00:00-07:00",
    timeZone: "Asia/Kolkata",
  },
  end: {
    dateTime: "2024-09-10T10:00:00-07:00",
    timeZone: "Asia/Kolkata",
  },
  colorId: 1,
  conferenceData: {
    createRequest: {
      requestId: uuidv4(),
    },
  },
  attendees: [{ email: "elraghymohamed@yahoo.com" }],
};

app.get("/create-event", async (req, res: Response) => {
  try {
    const result = await calendar.events.insert({
      calendarId: "primary",
      auth: oauth2Client,
      conferenceDataVersion: 1,
      sendUpdates: "all",
      resource: event,
    });

    res.send({
      status: 200,
      message: "Event created",
      link: result.data.hangoutLink,
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
