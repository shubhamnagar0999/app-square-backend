const express = require("express");
const mqtt = require("mqtt");
const firebase = require('firebase')

const app = express();
app.use(express.json());


const firebaseConfig = {
  apiKey: "AIzaSyBkWhCQ-ertW-D5v1r8BnPJ5ZPE2Bk1FU4",
  authDomain: "iot0999.firebaseapp.com",
  databaseURL: "https://iot0999-default-rtdb.firebaseio.com",
  projectId: "iot0999",
  storageBucket: "iot0999.appspot.com",
  messagingSenderId: "564787599105",
  appId: "1:564787599105:web:3506fc215f5b2f34c9ad00",
  measurementId: "G-M9RGW0L70F"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

app.get("/firestore/get", async (req, res) => {
  try {
    const Status = db.collection('TrackStatus');
    const snapshot = await Status.get();

    const data = []; // Array to store Firestore document data

    snapshot.forEach((doc) => {
      // Push each document's data into the array
      data.push({
        id: doc.id,
        ...doc.data() // Assuming Firestore document data is an object
      });
    });

    // Sending the array of document data as JSON response
    res.json({ data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});


// method for testing 
app.get("", (req, res) => {
  res.json({ data: "data for test." });
  // res.send("test url")
});

app.put("/firestore/put/:applianceName", async (req, res) => {
  try {
    const { applianceName } = req.params; // Extract applianceName from URL params
    const { status } = req.body; // Assuming only the 'status' field is sent in the request body

    const Status = db.collection('TrackStatus');
    
    // Find the document based on the applianceName
    const docRef = Status.doc(applianceName);

    // Update only the 'status' field in the document
    await docRef.update({ status });

    res.json({ message: `Status updated for applianceName '${applianceName}'` });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Error updating status' });
  }
});

// method for mqtt server
// MQTT broker/server configuration
const brokerUrl = "mqtt://91.121.93.94:1883"; // Replace 'your-broker-url' with the actual URL
const applianceNameStatus = "applianceNameStatus"; // Replace 'your/topic' with the desired topic
app.post("/mqtt", (req, res) => {
  // Create a MQTT client
  const client = mqtt.connect(brokerUrl);

  // When the client is connected
  client.on("connect", () => {
    console.log("Connected to MQTT broker");

    // Publish a message to the specified topic
    console.log(req.body);
    let mqtt_payload = {
        applianceNameStatus: `${req.body.applianceNameStatus}`,
        startHoure: `${req.body.startHoure}`,
        startMin: `${req.body.startMin}`,
        endHoure: `${req.body.endHoure}`,
        endMin: `${req.body.endMin}`
      
    }
    client.publish(applianceNameStatus, JSON.stringify(mqtt_payload), (err) => {
      if (err) {
        console.error("Error publishing message:", err);
      } else {
        // console.log(`Message published to ${topic}: ${message}`);
        client.end(); // Close the connection after publishing
        res.json({ applianceNameStatus: `${req.body.applianceNameStatus}` });
      }
    });
  });

  // Handle errors
  client.on("error", (err) => {
    console.error("Error:", err);
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});