import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.js';
import FeedbackBlog from '../models/feedbackBlog.js';
import {
  feedbacksInDb,
  initialComments,
  commentsInDb, initialFeedbacks
} from './helper_user.js';
import Comment from '../models/comment.js';

const api = supertest(app);

let user;

beforeAll(async () => {
  const newUser = {
    name: 'Richard',
    username: 'LionHeart',
    password: 'plantagenet1234'
  };

  await api
    .post('/api/users')
    .send(newUser);

  const res = await api
    .post('/api/login')
    .send({ username: newUser.username, password: newUser.password });

  user = res.body;
});

beforeEach(async () => {
  await Comment.deleteMany({});

  const commentObjects = initialComments.map(comment => new Comment(comment));
  const commentPromises = commentObjects.map(promise => promise.save());
  await Promise.all(commentPromises);
});

describe('Creation of a comment', () => {
  test('Creating a new comment with the right token successfully', async () => {
    const initialFeedbacks = await feedbacksInDb();
    const initialComments = await commentsInDb();
    const initialCommentsInFeedback = initialFeedbacks[0].comments;

    const newComment = {
      comment: 'That is a great suggestion!'
    };

    await api
      .post(`/api/feedbacks/${initialFeedbacks[0].id}`)
      .set({ 'Authorization': `bearer ${user.token}` })
      .send(newComment)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const finalFeedbacks = await feedbacksInDb();
    const finalComments = await commentsInDb();
    const finalCommentsInFeedback = finalFeedbacks[0].comments;

    expect(finalComments).toHaveLength(initialComments.length + 1);
    expect(finalCommentsInFeedback).toHaveLength(initialCommentsInFeedback.length + 1);
  });

  test('Trying to create a new comment with the wrong token will fail', async () => {
    const initialFeedbacks = await feedbacksInDb();
    const initialComments = await commentsInDb();
    const initialCommentsInFeedback = initialFeedbacks[0].comments;

    const newComment = {
      comment: 'That is a great suggestion!'
    };

    await api
      .post(`/api/feedbacks/${initialFeedbacks[0].id}`)
      .set({ 'Authorization': `bearer ${user.token}13432` })
      .send(newComment)
      .expect(401);

    const finalFeedbacks = await feedbacksInDb();
    const finalComments = await commentsInDb();
    const finalCommentsInFeedback = finalFeedbacks[0].comments;

    expect(finalComments).toHaveLength(initialComments.length);
    expect(finalCommentsInFeedback).toHaveLength(initialCommentsInFeedback.length);
  });

  test('Trying to create a new comment without content will fail', async () => {
    const initialFeedbacks = await feedbacksInDb();
    const initialComments = await commentsInDb();
    const initialCommentsInFeedback = initialFeedbacks[0].comments;

    const newComment = {
      comment: ''
    };

    await api
      .post(`/api/feedbacks/${initialFeedbacks[0].id}`)
      .set({ 'Authorization': `bearer ${user.token}` })
      .send(newComment)
      .expect(400);

    const finalFeedbacks = await feedbacksInDb();
    const finalComments = await commentsInDb();
    const finalCommentsInFeedback = finalFeedbacks[0].comments;

    expect(finalComments).toHaveLength(initialComments.length);
    expect(finalCommentsInFeedback).toHaveLength(initialCommentsInFeedback.length);
  });
});

afterAll(async () => {
  await User.deleteMany({});
  mongoose.connection.close();
});