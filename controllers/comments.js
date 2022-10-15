import express from 'express';
import Comment from '../models/comment.js';
import FeedbackBlog from '../models/feedbackBlog.js';

const commentsRouter = express.Router();

commentsRouter.post('/:feedbackId', async (req, res) => {
  const body = req.body;
  const user = req.user;

  console.log(user)
  console.log(req.token)

  if (!req.token || !user || !user.id) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  if (!body.comment) {
    return res.status(400).end();
  }

  const comment = await (new Comment({ comment: body.comment, author: user.id, })).save();

  const feedbackObject = await FeedbackBlog.findById(req.params.feedbackId);
  feedbackObject.comments = feedbackObject.comments.concat(comment.id);
  await feedbackObject.save();

  res.status(201).json(comment);
});

commentsRouter.delete('/:feedbackId/:id', async (req, res) => {
  const user = req.user;

  if (!req.token || !user || !user.id) {
    return res.status(401).json({ error: 'token missing or invalid'});
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(400).end();
  }

  if (comment.author.toString() !== user.id.toString()) {
    return res.status(401).json({ error: 'wrong user' });
  }

  const feedbackObject = await FeedbackBlog.findById(req.params.feedbackId);
  feedbackObject.comments = feedbackObject.comments.filter(commentId => commentId.toString() !== req.params.id);
  await feedbackObject.save();

  await Comment.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default commentsRouter;
