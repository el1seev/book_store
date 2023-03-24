import mongoose, { ConnectOptions } from 'mongoose';

require('dotenv').config();

export default class Database {
  public static async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URL!, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions);
      console.log(`Database connected successfully ${process.env.MONGO_URL!}`);
    } catch (err) {
      console.error(err);
    }
  }
}
