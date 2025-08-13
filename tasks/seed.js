import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Review from '../models/Review.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/bnbadvisor';

const seed = async () => {
  try {
    console.log('=== Running seed.js ===');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // 清空旧数据
    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    console.log('Old data cleared');

    // 创建加密密码
    const passwordHash = await bcrypt.hash('123456', 12);

    // 创建用户
    const managers = await User.insertMany([
      { firstName: 'Alice', lastName: 'Manager', email: 'alice.manager@example.com', password: passwordHash, role: 'manager' },
      { firstName: 'Bob', lastName: 'Manager', email: 'bob.manager@example.com', password: passwordHash, role: 'manager' },
    ]);

    const guests = await User.insertMany([
      { firstName: 'Charlie', lastName: 'Guest', email: 'charlie.guest@example.com', password: passwordHash, role: 'user' },
      { firstName: 'Daisy', lastName: 'Guest', email: 'daisy.guest@example.com', password: passwordHash, role: 'user' },
      { firstName: 'Eve', lastName: 'Guest', email: 'eve.guest@example.com', password: passwordHash, role: 'user' },
      { firstName: 'Frank', lastName: 'Guest', email: 'frank.guest@example.com', password: passwordHash, role: 'user' },
      { firstName: 'Grace', lastName: 'Guest', email: 'grace.guest@example.com', password: passwordHash, role: 'user' },
    ]);

    console.log('Users created');

    // 创建房源数据
    const propertyData = [
      { title: 'Cozy Countryside Cottage', city: 'Beijing', description: 'A quiet place with fresh air', pricePerNight: 80, rating: 4.7 },
      { title: 'Luxury Downtown Condo', city: 'Los Angeles', description: 'Right in the heart of the city', pricePerNight: 200, rating: 4.8 },
      { title: 'Mountain Cabin Retreat', city: 'Beijing', description: 'Perfect for nature lovers', pricePerNight: 120, rating: 4.6 },
      { title: 'Sunny Beach House', city: 'Los Angeles', description: 'Enjoy the sunshine and ocean', pricePerNight: 250, rating: 4.9 },
      { title: 'Modern City Apartment', city: 'Beijing', description: 'Stylish and convenient', pricePerNight: 150, rating: 4.3 },
      { title: 'Traditional Ryokan', city: 'Tokyo', description: 'Experience Japanese culture', pricePerNight: 180, rating: 4.5 },
      { title: 'Shinjuku Loft', city: 'Tokyo', description: 'Close to all attractions', pricePerNight: 170, rating: 4.4 },
      { title: 'Central Park View', city: 'New York', description: 'Amazing park views', pricePerNight: 300, rating: 4.8 },
      { title: 'Historic Brownstone', city: 'New York', description: 'Classic charm with modern amenities', pricePerNight: 280, rating: 4.7 },
      { title: 'Times Square Studio', city: 'New York', description: 'Right in the action', pricePerNight: 220, rating: 4.6 },
    ];

    // 随机分配给 manager
    const properties = await Property.insertMany(
      propertyData.map((p, idx) => ({
        ...p,
        owner: managers[idx % managers.length]._id,
      }))
    );

    console.log('Properties created');

    // 创建评论
    const reviewTexts = [
      'Amazing place, would visit again!',
      'Very comfortable and well located.',
      'Clean and cozy, highly recommended.',
      'Great host, smooth check-in.',
      'Wonderful views and quiet neighborhood.',
      'Perfect for a weekend getaway.',
      'Stylish interior and very spacious.',
      'Close to shops and restaurants.',
      'Good value for the price.',
      'Excellent amenities and service.',
    ];

    const reviews = [];
    let reviewCount = 0;
    for (let i = 0; i < properties.length && reviewCount < 20; i++) {
      // 每个房源添加 1-4 条评论
      const numReviews = Math.floor(Math.random() * 4) + 1;
      const shuffledGuests = guests.sort(() => 0.5 - Math.random());

      for (let j = 0; j < numReviews && reviewCount < 20; j++) {
        reviews.push({
          property: properties[i]._id,
          user: shuffledGuests[j % guests.length]._id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          likes: Math.floor(Math.random() * 21) 
        });
        reviewCount++;
      }
    }

    await Review.insertMany(reviews);
    console.log('Reviews created');

    console.log('=== Seed completed successfully ===');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting seed data:', err);
    process.exit(1);
  }
};

seed();
