import User from '../models/user.js';
import FeedbackBlog from '../models/feedbackBlog.js';

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

const initialFeedbacks = [
  {
    title: 'Foo Foo',
    content: 'Bar Bar',
    tag: 'Bug',
    likes: [],
    comments: []
  }
];

const feedbacksInDb = async () => {
  const feedbacks = await FeedbackBlog.find({});
  return feedbacks.map(feedback => feedback.toJSON());
};

export {
  initialUsers,
  initialFeedbacks,
  usersInDb,
  feedbacksInDb
};
