const mongoose = require('mongoose');
const dayjs = require('dayjs');
const todo = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remark: { type: String, required: true },
  date: { type: Date, default: Date.now },      // 发生日期
},{
  // timestamps: true // 自动添加 createdAt / updatedAt
  toJSON: { virtuals: true, transform: true },
})

// 关键：定义 transform 函数
todo.set('toJSON', {
  transform: function(doc, ret, options) {
    // doc: 原始 Mongoose 文档（不可直接修改）
    // ret: 即将被返回的普通 JavaScript 对象（可以修改！）
    // options: 其他选项（一般不用）

    // 1. 删除不需要的字段
    delete ret.__v;        // 删除版本字段
    delete ret.userId;  // 比如隐藏用户ID

    // 2. 格式化 date 字段
    if (ret.date) {
      ret.date = dayjs(ret.date).format('YYYY-MM-DD HH:mm:ss');
    }

    // 3. 可选：添加新字段
    ret.id = ret._id; // 或者重命名
    delete ret._id // 如果你也不想要 _id（谨慎！）

    // 必须返回 ret（修改后的对象）
    return ret;
  }
});

module.exports = mongoose.model('Todo',todo)