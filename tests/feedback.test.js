import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.js';
import FeedbackBlog from '../models/feedbackBlog.js';
import {
  initialFeedbacks,
  feedbacksInDb
} from './helper_user.js';

const api = supertest(app);

describe('When there are some feedback blogs saved', () => {
  beforeEach(async () => {
    await FeedbackBlog.deleteMany({});

    const feedbackObjects = initialFeedbacks.map(feedback => new FeedbackBlog(feedback));
    const feedbackPromises = feedbackObjects.map(promise => promise.save());
    await Promise.all(feedbackPromises);
  });

  test('All feedbacks are returned as json', async () => {
    const res = await api
      .get('/api/feedbacks')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(res.body).toHaveLength(initialFeedbacks.length);
  });

  test('A specific note is within the returned notes', async () => {
    const res = await api.get('/api/feedbacks');

    const contents = res.body.map(r => r.title);

    expect(contents).toContain(
      initialFeedbacks[0].title
    );
  });
});

describe('Addition of a new feedback blog', () => {
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

  test('Creating a new feedback blog with the right token successfully', async () => {
    const initialFeedbacks = await feedbacksInDb();

    const newFeedback = {
      title: 'Latin translation',
      content: 'Lorem ipsum dolor',
      tag: 'Feature',
      likes: [],
      comments: []
    };

    const res = await api
      .post('/api/feedbacks')
      .set({'Authorization': `bearer ${user.token}`})
      .send(newFeedback)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const finalFeedbacks = await feedbacksInDb();
    const titles = finalFeedbacks.map(feedback => feedback.title);

    expect(finalFeedbacks).toHaveLength(initialFeedbacks.length + 1);
    expect(titles).toContain(
      'Latin translation'
    );
  });

  test('Trying to create a new feedback blog with a wrong token will result in failure', async () => {
    const initialFeedbacks = await feedbacksInDb();

    const newFeedback = {
      title: 'Latin translation',
      content: 'Lorem ipsum dolor',
      tag: 'Feature',
      likes: [],
      comments: []
    };

    await api
      .post('/api/feedbacks')
      .set({'Authorization': `bearer ${user.token}324`})
      .send(newFeedback)
      .expect(401);

    const finalFeedbacks = await feedbacksInDb();

    expect(finalFeedbacks).toHaveLength(initialFeedbacks.length);
  });

  test('Creating a new feedback blog without the required fields of title or tag will result in failure', async () => {
    const initialFeedbacks = await feedbacksInDb();

    const newFeedNoTitle = {
      title: '',
      content: 'Lorem ipsum dolor',
      tag: 'Feature',
      likes: [],
      comments: []
    };

    const newFeedNoTag = {
      title: 'Latin translation',
      content: 'Lorem ipsum dolor',
      tag: '',
      likes: [],
      comments: []
    };

    await api
      .post('/api/feedbacks')
      .set({'Authorization': `bearer ${user.token}`})
      .send(newFeedNoTitle)
      .expect(400);

    await api
      .post('/api/feedbacks')
      .set({'Authorization': `bearer ${user.token}`})
      .send(newFeedNoTag)
      .expect(400);

    const finalFeedbacks = await feedbacksInDb();

    expect(finalFeedbacks).toHaveLength(initialFeedbacks.length);
  });

  afterAll(async () => {
    await User.deleteMany({});
  });
});

describe('Removal of a feedback blog', () => {
  let user;
  let feedbackId;

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
    const newFeedback = {
      title: 'Latin translation',
      content: 'Lorem ipsum dolor',
      tag: 'Feature',
      likes: [],
      comments: []
    };

    const res = await api
      .post('/api/feedbacks')
      .set({'Authorization': `bearer ${user.token}`})
      .send(newFeedback);

    feedbackId = res.body.id;
  });

  test('Deleting a feedback blog with the proprietary ID successfully', async () => {
    const initialFeedbacks = await feedbacksInDb();

    await api
      .delete(`/api/feedbacks/${feedbackId}`)
      .set({'Authorization': `bearer ${user.token}`})
      .expect(204);

    const finalFeedbacks = await feedbacksInDb();

    expect(finalFeedbacks).toHaveLength(initialFeedbacks.length - 1);
  });

  afterAll(async () => {
    await User.deleteMany({});
  });
});

afterAll(() => {
  mongoose.connection.close();
});
