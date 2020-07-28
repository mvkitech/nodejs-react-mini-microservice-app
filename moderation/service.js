const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

/**
 * HTTP 'POST' route listener used to handle events from 'Event Bus'.
 */
app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
	  
	// Possibly reject all comments related to clowns ... LOL
    const status = data.content.toLowerCase().includes('clown') ? 'rejected' : 'approved';

    // Send a 'Comment Moderated' status event to 'Event Bus'
    await axios.post('http://localhost:4005/events', {
      type: 'CommentModerated',
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content,
      },
    });
  }

  res.send({});
});

app.listen(4003, () => {
  console.log('Listening on 4003');
});
