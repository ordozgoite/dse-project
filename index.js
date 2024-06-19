const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config();
const mqtt = require('mqtt');

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

    // if (msg === 'mensagem_especifica') {
    //     suaFuncao();
    // }
});

// function suaFuncao() {
//     console.log('Função executada em resposta à mensagem específica');
// }

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