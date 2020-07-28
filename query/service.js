const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

/**
 * Helper function expression used to handle all the different
 * possible event types that could be received from 'Event Bus'.
 */
const handleEvent = (type, data) => {
	
  if (type === 'PostCreated') {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    const comment = post.comments.find((comment) => {
      return comment.id === id;
    });
    comment.status = status;
    comment.content = content;
  }
};

/**
 * HTTP 'GET' route listener used to return all handled posts.
 */
app.get('/posts', (req, res) => {
  res.send(posts);
});

/**
 * HTTP 'POST' route listener used to handle events from 'Event Bus'.
 */
app.post('/events', (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

app.listen(4002, async () => {
  console.log('Listening on 4002');
  
  // Possibly reconcile any events from 'Event Bus' in cases
  // where this 'Query Service' might have been shutdown. 
  const res = await axios.get('http://localhost:4005/events');
  for (let event of res.data) {
    console.log('Processing event:', event.type);
    handleEvent(event.type, event.data);
  }
});
