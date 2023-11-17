const mariadb = require("mariadb");

let pool = null;

const initializeMariaDB = () => {
  pool = mariadb.createPool({
    database: process.env.DB_NAME || "mychat",
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "mychat",
    password: process.env.DB_PASSWORD || "mychatpassword",
    connectionLimit: 5,
  });
};

const executeSQL = async (query, values = []) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(query, values);
    return res;
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.release();
  }
};

const initializeDBSchema = async () => {
  const userTableQuery = `CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  );`;
  await executeSQL(userTableQuery);
  const messageTableQuery = `CREATE TABLE IF NOT EXISTS messages (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`;
  await executeSQL(messageTableQuery);
};

const addUser = async (username) => {
  const query = 'INSERT INTO users (name) VALUES (?)';
  await executeSQL(query, [username]);
};

const getUserByName = async (username) => {
  const query = 'SELECT id FROM users WHERE name = ?';
  const result = await executeSQL(query, [username]);
  return result[0];
};

const saveMessage = async (username, message) => {
  const user = await getUserByName(username);
  const query = 'INSERT INTO messages (user_id, message) VALUES (?, ?)';
  await executeSQL(query, [user.id, message]);
};

module.exports = { executeSQL, initializeMariaDB, initializeDBSchema, addUser, getUserByName, saveMessage };
