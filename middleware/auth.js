const jwt = require('jsonwebtoken');
const User = require('../models/user');

const SECRET_KEY = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');

  console.log('Authorization header:', authorization);
  console.log('Bearer:', bearer);
  console.log('Token:', token);

  if (bearer !== 'Bearer' || !token) {
    console.error('Missing or invalid token');
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Decoded JWT:', decoded);

    const user = await User.findById(decoded.id);
    if (!user || user.token !== token) {
      console.error('User not found or token mismatch');
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = auth;
