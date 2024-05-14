import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication failed: No token provided' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);

    req.user = { userId: payload.userId };

    // const { userId, name } = payload;
    // req.user = { userId, name };


    next();
  } catch(error) {
    return res.status(401).json({ error: 'Authentication failed: Invalid token' });
  }
};

export default authenticate;
