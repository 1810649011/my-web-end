const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// 获取列表（分页可选）
router.get('/list', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, start, end, remark } = req.query;

    // 转换分页参数
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ error: 'page 和 limit 必须为正整数' });
    }
    console.log(mongoose.connection.readyState);
    
    // 构建查询条件
    const filter = { userId: req.user._id };
    // remark 模糊查询
    if (remark) {
      const safeRemark = remark.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      filter.remark = { $regex: safeRemark, $options: 'i' };
    }

    // 日期范围处理（注意：MongoDB Date 类型）
    if (start || end) {
      filter.date = {};

      if (start) {
        // start 是 "YYYY-MM-DD"，我们将其转为当天 00:00:00（本地时区）
        const startDate = new Date(start);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ error: 'start 日期格式无效，应为 YYYY-MM-DD' });
        }
        filter.date.$gte = startDate;
      }

      if (end) {
        // end 是 "YYYY-MM-DD"，我们将其转为当天 23:59:59.999
        const endDate = new Date(end);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ error: 'end 日期格式无效，应为 YYYY-MM-DD' });
        }
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    // 计算总数（用于分页）
    const total = await Todo.countDocuments(filter);

    // 查询数据（按日期倒序）
    const todo = await Todo.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      // .select('-__v -createdAt -updatedAt');

    // 返回结构化分页响应
    res.json({
      data: todo,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (err) {
    console.error('账单列表查询错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取详情
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ error: '账单不存在或无权限' });
    }

    res.json({
      data: todo,
      code: '200',
      msg:'操作成功'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新增
router.post('/', auth, async (req, res) => {
  try {
    const {remark } = req.body;

    // 简单校验
    if (!remark) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    const todo = new Todo({
      userId: req.user._id,
      date: new Date(),
      remark
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: '数据格式错误' });
    }
    res.status(500).json({ error: err.message });
  }
});

// 修改
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);

    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ error: '账单不存在或无权限' });
    }

    updates.forEach(update => todo[update] = req.body[update]);
    todo.date = new Date()
    await todo.save();
    
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ error: '账单不存在或无权限' });
    }

    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;