const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const events = [];

/**
 * HTTP 'POST' route listeners used to delegate events to
 * various other services.
 */
app.post('/events', (req, res) => {
  const event = req.body;

  events.push(event);

  axios.post('http://localhost:4000/events', event); // Posts Service
  axios.post('http://localhost:4001/events', event); // Comments Service
  axios.post('http://localhost:4002/events', event); // Query Service
  axios.post('http://localhost:4003/events', event); // Moderation Service

  res.send({ status: 'OK' });
});

/**
 * HTTP 'GET' route listener used to return all handled events.
 */
app.get('/events', (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log('Listening on 4005');
});
