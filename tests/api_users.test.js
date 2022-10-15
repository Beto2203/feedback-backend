import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import User from '../models/user.js';
import {
  initialUsers,
  usersInDb
} from './helper_user.js';

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  const userObjects = initialUsers.map(user => new User(user));
  const userPromises = userObjects.map(promise => promise.save());
  await Promise.all(userPromises);
});

describe('Creating a new user', () => {
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

afterAll(() => {
  mongoose.connection.close()
})