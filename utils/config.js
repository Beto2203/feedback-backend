import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const DB_URI = (process.env.NODE_ENV === 'test')
  ? process.env.TEST_DB_URI
  : process.env.DB_URI;

export { PORT, DB_URI }
