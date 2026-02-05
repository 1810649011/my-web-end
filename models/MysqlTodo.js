const db = require("../config/db");

class Todo {
  // 列表
  /**
   * 支持：模糊搜索(name) + 时间范围(date) + 分页 + 时间格式化
   * @param {Object} options
   * @param {string} [options.keyword] - name 模糊搜索
   * @param {string} [options.startTime] - 开始时间 (YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss)
   * @param {string} [options.endTime] - 结束时间 (同上)
   * @param {number} [options.page=1]
   * @param {number} [options.pageSize=10]
   */
  static async findList({
    keyword = "",
    startTime = "",
    endTime = "",
    page = 1,
    pageSize = 10,
  }) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const size = Math.max(1, Math.min(100, parseInt(pageSize) || 10));
    const offset = (pageNum - 1) * size;

    // 构建 WHERE 条件（安全！使用参数化查询）
    let whereClauses = [];
    let params = [];

    if (keyword) {
      whereClauses.push("remark LIKE ?");
      params.push(`%${keyword}%`); // 注意：% 包裹在值中，不是 SQL 里
    }

    // 2. 时间范围查询（startTime 和 endTime 都需要是有效日期字符串）
    if (startTime) {
      
      // 自动补全为完整时间格式（只传日期时，默认从 00:00:00 开始）
      const start = startTime.length === 10 ? `${startTime} 00:00:00` : startTime;
      console.log('startTime',startTime);
      console.log('start',start);
      whereClauses.push("date >= ?");
      params.push(start);
    }

    if (endTime) {
      // 只传日期时，默认到 23:59:59 结束
      const end = endTime.length === 10 ? `${endTime} 23:59:59` : endTime;
      whereClauses.push("date <= ?");
      params.push(end);
    }
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    // 1. 查询当前页数据
    const sqlData = `
      SELECT id, remark, DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') AS date
      FROM todo 
      ${whereClause}
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `;
    params.push(size, offset);
    const rows = await db.query(sqlData, params);

    // 2. 查询总记录数（带相同搜索条件）
    const sqlCount = `
      SELECT COUNT(*) AS total 
      FROM todo 
      ${whereClause}
    `;
    const countParams = params.slice(0, -2)
    const [{ total }] = await db.query(sqlCount, countParams);
    return {
      rows,
      total,
    };
  }
  // 获取
  static async findById(id) {
    const rows = await db.query(
      "SELECT id, remark, date FROM todo WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  }
  // 新增
  static async create({ remark = "" }) {
    const rows = await db.execute("INSERT INTO todo (remark) VALUES (?)", [
      remark,
    ]);
  }
  // 修改
  static async update(id, data) {
    const { remark } = data;
    const updates = [];
    const values = [];

    if (remark !== undefined) {
      updates.push("remark = ?");
      values.push(remark);
    }
    if (updates.length === 0) throw new Error("修改发生错误");

    values.push(id);
    const sql = `UPDATE todo SET ${updates.join(",")} WHERE id = ?`;
    await db.execute(sql, values);
  }
  // 删除
  static async delete(id) {
    await db.execute("DELETE FROM todo WHERE id = ?", [id]);
  }
}

module.exports = Todo;
