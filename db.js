const mongoose = require('mongoose');

const connectDB = async () => {
 try {
    await mongoose.connect('mongodb+srv://ewa:ewa@ewa.ihpglqx.mongodb.net/ticket', {
      /* These are options passed to the `mongoose.connect()` method to configure the behavior of the
      MongoDB connection: */
      useNewUrlParser: true, useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
 } catch (err) {
    console.error(err.message);
    process.exit(1);
 }
};

module.exports = connectDB;
