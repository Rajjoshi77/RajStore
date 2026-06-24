import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const usersCollection = conn.connection.db.collection('users');
    const indexes = await usersCollection.indexes();
    const usernameIndex = indexes.find((index) => index.name === 'username_1');

    if (usernameIndex) {
      await usersCollection.dropIndex('username_1');
      console.log('Dropped legacy username unique index from users collection');
    }
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;