const jwt = require('jsonwebtoken');
const { User, AdminUser } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      student_id: user.student_id
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Admin access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await AdminUser.findByPk(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    req.admin = {
      id: admin.id,
      email: admin.email
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired admin token' });
  }
};

module.exports = { authenticateToken, authenticateAdmin };