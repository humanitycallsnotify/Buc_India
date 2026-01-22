const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // Check for token in Authorization header as fallback
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("No token found in cookies or authorization header");
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
