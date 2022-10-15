import jwt from 'jsonwebtoken';

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);
  }
  else req.token = null;

  next();
};

const userExtractor = (req, res, next) => {
  try {
    if (req.token) req.user = jwt.verify(req.token, process.env.SECRET);
  }
  catch (err) {
    res.status(401).json({ error: 'Invalid token'});
  }

  next();
}

export {
  tokenExtractor,
  userExtractor
};