import User from '../models/user.js';

const initialUsers = [
  {
    username: 'bob22',
    name: 'Robert F.',
    password: 'Foobar'
  },
  {
    username: 'timmy123',
    name: 'Tim',
    password: 'Brains123'
  }
];

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

export {
  initialUsers,
  usersInDb
};
