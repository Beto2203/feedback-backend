import express from 'express';
import FeedbackBlog from '../models/feedbackBlog.js';
import User from '../models/user.js';
import Comment from '../models/comment.js';

const feedbackRouter = express.Router();

feedbackRouter.get('/', async (req, res) => {
  const feedbacks = await FeedbackBlog
    .find({})
    .populate('author', {name: 1, username: 1})
    .populate('comments', {comment: 1, user: 1, answers: 1});

  res.json(feedbacks);
});

feedbackRouter.post('/', async (req, res) => {
  const body = req.body;
  const user = req.user;

  if (!req.token || !user || !user.id) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  if (!body.title || !body.tag) {
    return res.status(400).end();
  }

  const feedback = await (new FeedbackBlog({author: user.id, ...body})).save();

  const userObject = await User.findById(user.id);
  userObject.feedbackBlogs = userObject.feedbackBlogs.concat(feedback.id);
  await userObject.save();

  res.status(201).json(feedback);
});

feedbackRouter.delete('/:id', async (req, res) => {
  const user = req.user;

  if (!req.token || !user || !user.id) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  const feedback = await FeedbackBlog.findById(req.params.id);
  if (!feedback) {
    return res.status(400).end();
  }

  if (feedback.author.toString() !== user.id.toString()) {
    return res.status(401).json({ error: 'wrong user' });
  }


  const author = await User.findById(feedback.author.toString());
  author.feedbackBlogs = author.feedbackBlogs.filter(feedbackId => feedbackId.toString() !== req.params.id);
  author.save();

  const commentPromises = feedback.comments.map(commentId => Comment.findByIdAndDelete(commentId.toString()));
  await Promise.all(commentPromises);

  await FeedbackBlog.findByIdAndDelete(req.params.id);

  res.status(204).end();
});

export default feedbackRouter;
