import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

const usersRouter = express.Router();

usersRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || username.length < 3 || !password || password.length < 4) return res.status(400).end();

  const repeatedUser = await User.findOne({ username });
  if (repeatedUser) return res.status(400).json({error: 'Username is already taken'});

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    passwordHash
  });

  const savedUser = await user.save();

  res.status(201).json(savedUser);
});

if (process.env.NODE_ENV === 'test') {
  usersRouter.get('/', async (req, res) => {
    const users = await User.find({});

    res.status(200).json(users);
  });
}

export default usersRouter;