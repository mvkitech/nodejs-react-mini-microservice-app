const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

/**
 * HTTP 'GET' route listener used to return all comments which happen
 * to be associated with specified Post to back to the React client.
 */
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

/**
 * HTTP 'POST' route listener used to handle "New Comments" events
 * associated with a specified Post from the React client.
 */
app.post('/posts/:id/comments', async (req, res) => {
	
  const { content } = req.body;

  // Create and store a new comments instance in array
  const commentId = randomBytes(4).toString('hex');
  const comments = commentsByPostId[req.params.id] || [];
  comments.push({ id: commentId, content, status: 'pending' });
  commentsByPostId[req.params.id] = comments;

  // Send a 'Comments Created' event to the 'Event Bus' service
  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });

  // Send positive response back to React client
  res.status(201).send(comments);
});

/**
 * HTTP 'POST' route listener waiting for events from "Event Bus".
 */
app.post('/events', async (req, res) => {
  console.log('Event Received:', req.body.type);

  const { type, data } = req.body;

  // Determine if this is a 'moderation' event
  if (type === 'CommentModerated') {
    const { postId, id, status, content } = data;

    // Update the comment 'moderation' status value
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    comment.status = status;

    // Send a 'Comments Updated' event to the 'Event Bus'
    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log('Listening on 4001');
});
