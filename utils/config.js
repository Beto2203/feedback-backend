import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT;
const DB_URI = (process.env.NODE_ENV === 'test')
  ? process.env.TEST_DB_URI
  : process.env.DB_URI;

const rootUser = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
}


export { PORT, DB_URI, rootUser };
