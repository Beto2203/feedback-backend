import User from '../models/user.js';
import FeedbackBlog from '../models/feedbackBlog.js';
import Comment from '../models/comment.js';

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

const initialComments = [
  {
    comment: 'Hey! Thank you for your feedback'
  },
  {
    comment: 'A dark mode for the app will be amazing'
  }
];

const commentsInDb = async () => {
  const comments = await Comment.find({});
  return comments.map(comment => comment.toJSON());
};

export {
  initialUsers,
  initialFeedbacks,
  initialComments,
  usersInDb,
  feedbacksInDb,
  commentsInDb
};
