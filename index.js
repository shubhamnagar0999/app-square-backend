const express = require("express");
const mqtt = require("mqtt");

const app = express();
app.use(express.json());

app.get("", (req, res) => {
  res.json({ data: "data for test." });
});

// =====================================  mqtt server starts =========================================================

// MQTT broker/server configuration
// const brokerUrl = "mqtt://91.121.93.94:1883";
const brokerUrl = "https://test.mosquitto.org/"; 
const applianceNameStatus = "applianceNameStatus"; 
const client = mqtt.connect(brokerUrl);

client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

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
    room: `${req.body.room}`
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
// ===================================== mqtt server status start =========================================================
app.post("/mqtt-status", (req, res) => {
  const tempClient = mqtt.connect(brokerUrl);
  let responded = false;

  tempClient.on("connect", () => {
    if (!responded) {
      responded = true;
      res.json({ status: "active", message: "MQTT connection successful." });
      tempClient.end(); 
    }
  });

  tempClient.on("error", (err) => {
    if (!responded) {
      responded = true;
      res.status(500).json({ status: "inactive", message: "MQTT connection failed.", error: err.message });
      tempClient.end(); 
    }
  });

  setTimeout(() => {
    if (!responded) {
      responded = true;
      res.status(504).json({ status: "inactive", message: "MQTT connection timed out." });
      tempClient.end(); 
    }
  }, 30000); 
});
// ===================================== mqtt server status end =========================================================

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
