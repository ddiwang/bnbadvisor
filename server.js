import app from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb://localhost:27017/mydb';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('DB connection error:', err);
});