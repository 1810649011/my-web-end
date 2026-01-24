const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 获取当前用户
const auth = async (req,res, next) =>{
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    req.user = user; // 将用户信息挂到 req 上
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的认证令牌' });
  }
}

module.exports = auth;