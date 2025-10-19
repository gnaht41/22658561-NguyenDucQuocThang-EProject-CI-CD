const jwt = require('jsonwebtoken');
require('dotenv').config();

function isAuthenticated(req, res, next) {
  // Check for the presence of an authorization header
  const authHeader = req.headers.authorization; // ① đọc header Authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Extract the token from the header
  // Authorization: Bearer < token >
  const token = authHeader.split(' ')[1]; // ② tách phần token sau chữ “Bearer”

  try {
    // Verify the token using the JWT library and the secret key
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);  // ③ giải mã token
    req.user = decodedToken;  // ④ gắn thông tin user vào req.user
    next();                   // ⑤ cho phép request đi tiếp
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = isAuthenticated;
