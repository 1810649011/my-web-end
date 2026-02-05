const express = require("express");
const Todo = require("../models/MysqlTodo");

const router = express.Router();

// 获取列表（不分页）
router.get("/list", async (req, res) => {
  const data = await Todo.findList(req.query);
  res.json({
    code: 200,
    ...data,
  });
});
// 获取详情
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "账单不存在或无权限" });
    }

    res.json({
      data: todo,
      code: "200",
      msg: "操作成功",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新增
router.post("/", async (req, res) => {
  try {
    const { remark } = req.body;
    // 简单校验
    if (!remark) {
      return res.status(400).json({ error: "内容不能为空" });
    }
    await Todo.create({ remark });
    res.json({
      code: "200",
      msg: "操作成功",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 修改
router.patch("/:id", async (req, res) => {
  try {
    await Todo.update(req.params.id, { remark: req.body.remark });
    res.json({
      code: "200",
      msg: "操作成功",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除
router.delete("/:id", async (req, res) => {
  try {
    await Todo.delete(req.params.id);
    res.json({
      code: "200",
      msg: "操作成功",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
