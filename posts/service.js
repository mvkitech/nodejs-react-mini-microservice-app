const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

/**
 * HTTP 'GET' route listener used to return all posts back 
 * to the React client.
 */
app.get('/posts', (req, res) => {
  res.send(posts);
});

/**
 * HTTP 'POST' route listener used to handle "New Post" events 
 * from the React client.
 */
app.post('/posts', async (req, res) => {
	
  const { title } = req.body;

  // Create and store new post instance in posts array
  const id = randomBytes(4).toString('hex');
  posts[id] = {
    id,
    title,
  };

  // Send a 'Post Created' event to the 'Event Bus'
  await axios.post('http://localhost:4005/events', {
    type: 'PostCreated',
    data: {
      id,
      title,
    },
  });

  // Send positive response back to React client
  res.status(201).send(posts[id]);
});

/**
 * HTTP 'POST' route listener waiting for events from "Event Bus".
 */
app.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log('Listening on 4000');
});
