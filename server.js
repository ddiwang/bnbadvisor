import app from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {

  
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
   
  });
})
.catch(err => {
  console.error(' error:', err);
  process.exit(1);
});
