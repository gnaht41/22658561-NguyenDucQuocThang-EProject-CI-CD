const jwt = require('jsonwebtoken');
require('dotenv').config();

function isAuthenticated(req, res, next) {
  // Check for the presence of an authorization header
  const authHeader = req.headers.authorization;   // Lấy header 'Authorization'
  if (!authHeader) {
    // Nếu không có header, trả lỗi 401 Unauthorized
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the JWT library and the secret key
    // Xác thực token bằng secret key lấy từ biến môi trường
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Nếu token hợp lệ, payload (thông tin user) sẽ được giải mã
    // Gắn thông tin đã giải mã vào req.user để các hàm xử lý sau có thể dùng
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = isAuthenticated;
