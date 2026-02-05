const mysql = require('mysql2/promise');
require('dotenv').config(); 
 
const pool  = mysql.createPool({
    host: process.env.MYSQL_HOST, // 替换为你的 RDS 外网或内网地址
    port: process.env.MYSQL_PROT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE, // 可选，如果不指定则连接后需手动 USE
    connectionLimit: 10,
    charset: 'utf8mb4',
    timezone: '+08:00' // 可选：设置时区
    // 可选：SSL 配置（阿里云 RDS 默认支持 SSL，但非强制）
    // ssl: {
    //   rejectUnauthorized: true
    // }
});
  
  
// 封装 query 方法，便于统一处理
module.exports = {
    async query(sql, params) {
      try {
        const [rows, fields] = await pool.query(sql, params);
        return rows;
      } catch (err) {
        console.error('数据库错误-------:', err.message);
        throw err;
      }
    },
    async execute(sql, params) {
      try {
        const [rows, fields] = await pool.execute(sql, params);
        return rows;
      } catch (err) {
        console.error('数据库错误-------:', err.message);
        throw err;
      }
    }
};