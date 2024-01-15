const express = require("express");
const mqtt = require("mqtt");

const app = express();
app.use(express.json());

// method for testing
app.get("", (req, res) => {
  res.json({ data: "data for test." });
  // res.send("test url")
});

// =====================================  mqtt server starts =========================================================

// MQTT broker/server configuration
// const brokerUrl = "mqtt://91.121.93.94:1883";
const brokerUrl = "https://test.mosquitto.org/"; // Replace 'your-broker-url' with the actual URL
const applianceNameStatus = "applianceNameStatus"; // Replace 'your/topic' with the desired topic

// Create a MQTT client
const client = mqtt.connect(brokerUrl);

// When the client is connected
client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

// Handle errors
client.on("error", (err) => {
  console.error("Error:", err);
});

app.post("/mqtt", (req, res) => {
  // Publish a message to the specified topic
  console.log(req.body);
  let mqtt_payload = {
    applianceNameStatus: `${req.body.applianceNameStatus}`,
    startHoure: `${req.body.startHoure}`,
    startMin: `${req.body.startMin}`,
    endHoure: `${req.body.endHoure}`,
    endMin: `${req.body.endMin}`,
    timer: `${req.body.timer}`,
  };
  client.publish(applianceNameStatus, JSON.stringify(mqtt_payload), (err) => {
    if (err) {
      console.error("Error publishing message:", err);
    } else {
      res.json({ applianceNameStatus: `${req.body.applianceNameStatus}` });
    }
  });
});

// ===================================== mqtt server ends =========================================================

// Handle server shutdown gracefully by closing the MQTT connection
process.on("SIGINT", () => {
  console.log("Shutting down gracefully");
  client.end();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
