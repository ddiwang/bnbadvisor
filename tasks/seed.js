import mongoose from 'mongoose';
import Property from '../models/Property.js';

const MONGO_URI = 'mongodb://localhost:27017/bnbadvisor';

const seedData = [
  { title: 'Sunny Villa', city: 'Los Angeles', description: 'Beautiful stay in LA', rating: 4.8 },
  { title: 'Cozy Cabin', city: 'Tokyo', description: 'Great for ski trips', rating: 4.5 },
  { title: 'Urban Nest', city: 'New York', description: 'In the heart of the city', rating: 4.7 },
  { title: 'Beachfront Bliss', city: 'Beijing', description: 'Ocean view room', rating: 4.9 },
  { title: 'Historic Haven', city: 'Beijing', description: 'Old charm, modern comfort', rating: 4.3 },
  { title: 'Skyline Loft', city: 'Tokyo', description: 'Perfect for business trips', rating: 4.4 },
  { title: 'Mountain Retreat', city: 'Beijing', description: 'Escape the noise', rating: 4.6 },
  { title: 'Desert Dream', city: 'New York', description: 'Sunny and serene', rating: 4.2 },
  { title: 'Lakeview Lodge', city: 'New York', description: 'Wake up to nature', rating: 4.8 },
  { title: 'Art House', city: 'New York', description: 'Creative vibes everywhere', rating: 4.5 },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await Property.deleteMany({});
    await Property.insertMany(seedData);
    console.log('Seed data inserted!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting seed data:', err);
  }
};

seedDatabase();