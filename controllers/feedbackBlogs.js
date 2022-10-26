import express from 'express';
import FeedbackBlog from '../models/feedbackBlog.js';
import User from '../models/user.js';
import Comment from '../models/comment.js';

const feedbackRouter = express.Router();

feedbackRouter.get('/', async (req, res) => {
  const feedbacks = await FeedbackBlog
    .find({})
    .populate('author', {name: 1, username: 1})
    .populate({
      path: 'comments',
      model: 'Comment',
      populate: {
        path: 'author',
        model: 'User',
        select: {username: 1, id: 1}
      }
    });

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

  const feedback = await (new FeedbackBlog({author: user.id, comments: [], likes: [], ...body})).save();

  res.status(201).json(feedback);
});

feedbackRouter.put('/likes/:id', async (req, res) => {
  const feedbackId = req.params.id;
  const user = req.user;

  if (!req.token || !user || !user.id) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  const feedback = await FeedbackBlog.findById(feedbackId);

  if (!feedback) return res.status(400).end();

  const alreadyLiked = feedback.likes.find(likeId => likeId.toString() === user.id);
  if (alreadyLiked) {
    feedback.likes = feedback.likes.filter(likeId => likeId.toString() !== user.id);
  }
  else {
    feedback.likes = feedback.likes.concat(user.id);
  }
  await feedback.save();
  return res.status(200).end();
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

  const commentPromises = feedback.comments.map(commentId => Comment.findByIdAndDelete(commentId.toString()));
  await Promise.all(commentPromises);
  await FeedbackBlog.findByIdAndDelete(req.params.id);

  res.status(204).end();
});

export default feedbackRouter;
