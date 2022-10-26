import jwt from 'jsonwebtoken';

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('Authorization');
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
    console.log('Failed verification');
  }

  next();
}

export {
  tokenExtractor,
  userExtractor
};
