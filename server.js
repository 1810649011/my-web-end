require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');
const app = express();
const PORT = process.env.PORT || 1111;

app.use(cors());
app.use(express.json());

// 连接 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('数据库已连接'))
  .catch(err => console.error(err));

// 路由
app.use('/auth', authRoutes);
app.use('/todo', todoRoutes);

app.listen(PORT, () => {
  console.log(`服务启动成功 on http://localhost:${PORT}`);
});