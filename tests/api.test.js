import mongoose, { get } from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import User from '../models/user.js';
import FeedbackBlog from '../models/feedbackBlog.js';
import {
  initialUsers,
  initialFeedbacks,
  usersInDb,
  feedbacksInDb
} from './helper_user.js';
import feedbackBlogs from '../controllers/feedbackBlogs.js';

const api = supertest(app);

describe('Creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const userObjects = initialUsers.map(user => new User(user));
    const userPromises = userObjects.map(promise => promise.save());
    await Promise.all(userPromises);
  });
  test('A new user can be added', async () => {
    const initialUsers = await usersInDb();
    const newUser = {
      name: 'Richard',
      username: 'LionHeart',
      password: 'plantagenet1234'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const finalUsers = await usersInDb();
    const usernames = finalUsers.map(user => user.username);

    expect(finalUsers).toHaveLength(initialUsers.length + 1);
    expect(usernames).toContain(
      'LionHeart'
    );
  });

  test('User without name is not added', async () => {
    const initialUsers = await usersInDb();
    const newUser = {
      name: '',
      username: 'LionHeart',
      password: 'plantagenet1234'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const finalUsers = await usersInDb();

    expect(finalUsers).toHaveLength(initialUsers.length);
  });

  test('Users without username or with a username too short are not added', async () => {
    const initialUsers = await usersInDb();
    const newUserNoUsername = {
      name: 'Richard',
      username: '',
      password: 'plantagenet1234'
    };
    const newUserUsernameShort = {
      name: 'Richard',
      username: 'Li',
      password: 'plantagenet1234'
    };

    await api
      .post('/api/users')
      .send(newUserNoUsername)
      .expect(400);

    await api
      .post('/api/users')
      .send(newUserUsernameShort)
      .expect(400);

    const finalUsers = await usersInDb();

    expect(finalUsers).toHaveLength(initialUsers.length);
  });

  test('Users without password or with a password too short are not added', async () => {
    const initialUsers = await usersInDb();
    const newUserNoPass = {
      name: 'Richard',
      username: 'LionHeart',
      password: ''
    };
    const newUserPassShort = {
      name: 'Richard',
      username: 'LionHeart',
      password: 'pla'
    };

    await api
      .post('/api/users')
      .send(newUserNoPass)
      .expect(400);

    await api
      .post('/api/users')
      .send(newUserPassShort)
      .expect(400);

    const finalUsers = await usersInDb();

    expect(finalUsers).toHaveLength(initialUsers.length);
  });

  test('A user with a repeated username will not be added', async () => {
    const initialUsers = await usersInDb();
    const newUser = {
      name: 'Richard',
      username: initialUsers[0].username,
      password: 'plantagenet1234'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const finalUsers = await usersInDb();

    expect(finalUsers).toHaveLength(initialUsers.length);
  });
});

describe('Log in to the app', () => {
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

    user = { username: newUser.username, password: newUser.password };
  });

  test('Login with an existing user successfully', async () => {
    await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('Log in with a nonexistent username', async () => {
    await api
      .post('/api/login')
      .send({ username: 'blabla', password: user.password })
      .expect(401);
  });

  test('Log in with an existing username but a wrong password', async () => {
    await api
      .post('/api/login')
      .send({ username: user.username, password: 'notTheActualPassword' })
      .expect(401);
  });
});

describe('When there are some feedback blogs saved', () => {
  beforeEach(async () => {
    await FeedbackBlog.deleteMany({});

    const feedbackObjects = initialFeedbacks.map(feedback => new FeedbackBlog(feedback));
    const feedbackPromises = feedbackObjects.map(promise => promise.save());
    await Promise.all(feedbackPromises);
  });

  test('All feedbacks are returned as json', async () => {
    const res = await api
      .get('/')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(res.body).toHaveLength(initialFeedbacks.length);
  });

  test('A specific note is within the returned notes', async () => {
    const res = await api.get('/');

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
      .post('/')
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

  test('Creating a new feedback blog with a wrong token will result in failure', async () => {
    const initialFeedbacks = await feedbacksInDb();

    const newFeedback = {
      title: 'Latin translation',
      content: 'Lorem ipsum dolor',
      tag: 'Feature',
      likes: [],
      comments: []
    };

    await api
      .post('/')
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
      .post('/')
      .set({'Authorization': `bearer ${user.token}`})
      .send(newFeedNoTitle)
      .expect(400);

    await api
      .post('/')
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

describe('Removal a feedback blog', () => {
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
      .post('/')
      .set({'Authorization': `bearer ${user.token}`})
      .send(newFeedback);

    feedbackId = res.body.id;
  });

  test('Deleting a feedback blog with the proprietary ID successfully', async () => {
    const initialFeedbacks = await feedbacksInDb();

    await api
      .delete(`/${feedbackId}`)
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
  mongoose.connection.close()
})