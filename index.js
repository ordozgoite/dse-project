const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config();
const mqtt = require('mqtt');
const admin = require('firebase-admin');
const RecognitionAttempt = require('./models/RecognitionAttempt');

const serviceAccount = require('./dee-project-d1017-firebase-adminsdk-mg1jm-af073350a1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// async function sendMockMessage() {
//   const message = {
//     notification: {
//         title: "Título",
//         body: "Corpo"
//     },
//     apns: {
//         headers: {
//             'apns-priority': '10',
//         },
//         payload: {
//             aps: {
//                 sound: 'default',
//             }
//         },
//     },
//     token: "esRDji5INk9jgWvepgp3z8:APA91bHW-xxp6-3dav-LdpY_3LTL4kFwkqeUgNUzvQPFaQbkJ7VtLj4rLYZY7M0eMGNcYNUxXE2LslzOpoCqS6P2tRvWdVERlFB5fCjdM20afCyWLKoAysPtOAPx7nN8yMW4dupIRuYk"
// };

// admin.messaging().send(message)
//     .then((response) => {
//         console.log('Successfully sent message:', response);
//     })
//     .catch((error) => {
//         console.log('Error sending message:', error);
//     });
// }

// sendMockMessage();

// URL do broker MQTT com TLS
const brokerUrl = 'mqtts://ecd8950746cc4cbe99f19f8a4d3a2f23.s1.eu.hivemq.cloud:8883';
const options = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
};

// Conectar ao broker
const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Inscrever-se em um tópico específico
  client.subscribe('dse/register', (err) => {
    if (!err) {
      console.log('Subscribed to topic');
    }
  });
});

client.on('message', (topic, message) => {
  const msg = message.toString();

  console.log(`Received message: ${msg} on topic: ${topic}`);
  PostNewRecognitionAttempt()
});

async function PostNewRecognitionAttempt(result, username) {
  const now = new Date();

  const newAttempt = new RecognitionAttempt({
    timestamp: now.getTime(),
    result: result,
    username: username
  });

  const title = result == "allowed" ? "✅ Porta Aberta" : "⚠️ Alerta!"
  const body = username != null ? username + " acabou de chegar" : "Um desconhecido tentou entrar"
  sendPushNotification(title, body); 

  await newAttempt.save();
}

async function sendPushNotification(title, body) {
  const message = {
    notification: {
        title: title,
        body: body
    },
    apns: {
        headers: {
            'apns-priority': '10',
        },
        payload: {
            aps: {
                sound: 'default',
            }
        },
    },
    token: "esRDji5INk9jgWvepgp3z8:APA91bHW-xxp6-3dav-LdpY_3LTL4kFwkqeUgNUzvQPFaQbkJ7VtLj4rLYZY7M0eMGNcYNUxXE2LslzOpoCqS6P2tRvWdVERlFB5fCjdM20afCyWLKoAysPtOAPx7nN8yMW4dupIRuYk"
};

admin.messaging().send(message)
    .then((response) => {
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });
}

function openDoor() {
  const topic = 'dse/open';
  const message = 'open';

  client.publish(topic, message, (err) => {
    if (err) {
      console.error('Failed to publish message:', err);
    } else {
      console.log(`Message '${message}' sent to topic '${topic}'`);
    }
  });
}

module.exports = {
  openDoor
};

const recognitionAttemptRoute = require('./routes/RecognitionAttempt');

const app = express()
const port = process.env.PORT || 3000
mongoose.set("strictQuery", true);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/RecognitionAttempt', recognitionAttemptRoute);

// connect to mongodb atlas
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error.message);
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})