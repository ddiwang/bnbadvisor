import mongoose from 'mongoose';


// const MONGO_URI = 'mongodb://localhost:27017/mydb';

// const seedData = [
//   { title: 'Sunny Villa', city: 'Los Angeles', description: 'Beautiful stay in LA', rating: 4.8 },
//   { title: 'Cozy Cabin', city: 'Tokyo', description: 'Great for ski trips', rating: 4.5 },
//   { title: 'Urban Nest', city: 'New York', description: 'In the heart of the city', rating: 4.7 },
//   { title: 'Beachfront Bliss', city: 'Beijing', description: 'Ocean view room', rating: 4.9 },
//   { title: 'Historic Haven', city: 'Beijing', description: 'Old charm, modern comfort', rating: 4.3 },
//   { title: 'Skyline Loft', city: 'Tokyo', description: 'Perfect for business trips', rating: 4.4 },
//   { title: 'Mountain Retreat', city: 'Beijing', description: 'Escape the noise', rating: 4.6 },
//   { title: 'Desert Dream', city: 'New York', description: 'Sunny and serene', rating: 4.2 },
//   { title: 'Lakeview Lodge', city: 'New York', description: 'Wake up to nature', rating: 4.8 },
//   { title: 'Art House', city: 'New York', description: 'Creative vibes everywhere', rating: 4.5 },
// ];

// const seedDatabase = async () => {
//   try {
//     await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//     await Property.deleteMany({});
//     await Property.insertMany(seedData);
//     console.log('✅ Seed data inserted!');
//     mongoose.connection.close();
//   } catch (err) {
//     console.error('❌ Error inserting seed data:', err);
//   }
// };

// seedDatabase();

// tasks/seed.js
import  Property from '../models/Property.js';
import  Users from '../models/Users.js';
import  Reviews from '../models/Reviews.js';

import bcrypt from 'bcryptjs';

// 初始化测试数据
export const seedDatabase = async () => {
  try {
    // 清空现有集合（可选，根据需求决定）
    await Property.deleteMany({});
    await Users.deleteMany({});
    await Reviews.deleteMany({});
    
    console.log('Cleared existing data');
    
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUsers = [
      { 
        firstName: 'John', 
        lastName: 'Doe',
        phoneNumber: '15074906491',
        email: 'john@example.com', 
        hashedPassword,
        profilePicture: 'default.jpg',
        role: 'user'
      },
      { 
        firstName: 'Jane', 
        lastName: 'Smith', 
        phoneNumber: '15074906491',
        email: 'jane@example.com', 
        hashedPassword,
        profilePicture: 'default.jpg',
        role: 'user'
      },
      { 
        firstName: 'Manager', 
        lastName: 'One', 
        phoneNumber: '15074906491',
        email: 'manager@example.com', 
        hashedPassword,
        profilePicture: 'manager.jpg',
        role: 'manager'
      }
    ];
    
    const insertedUsers = await Users.insertMany(testUsers);
    console.log(`Inserted ${insertedUsers.length} users`);
    
    // 获取用户ID - 使用Mongoose方式
    const userIds = insertedUsers.map(user => user._id);
    const managerId = userIds.find(id => 
      testUsers[insertedUsers.findIndex(u => u._id.equals(id))].role === 'manager'
    );
    
    // 创建测试房源
    const testProperties = [
      {
        type: 'Apartment',
        hostId: managerId,
        title: 'Cozy Apartment in Downtown',
        description: 'A lovely apartment in the heart of the city',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA'
        },
        pricePerNight: 120,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Kitchen', 'TV', 'Heating'],
        photo: 'apartment1.jpg',
        houseRules: ['No smoking', 'No parties'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 添加更多房源...
    ];
    
    const insertedProperties = await Property.insertMany(testProperties);
    console.log(`Inserted ${insertedProperties.length} properties`);
    
    // 获取房源ID
    const propertyIds = insertedProperties.map(property => property._id);
    
    // 创建测试评论
    const testReviews = [
      {
        listingId: propertyIds[0],
        guestId: userIds[0],
        hostId: managerId,
        rating: 4.5,
        comment: 'Great place to stay! The location was perfect and the host was very responsive.',
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 5
      },
      {
        listingId: propertyIds[0],
        guestId: userIds[1],
        hostId: managerId,
        rating: 5,
        comment: 'Absolutely loved this apartment. Will definitely come back!',
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 8
      }
      // 添加更多评论...
    ];
    
    const insertedReviews = await Reviews.insertMany(testReviews);
    console.log(`Inserted ${insertedReviews.length} reviews`);
    
    return {
      users: userIds,
      properties: propertyIds,
      reviews: insertedReviews.length
    };
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

// 检查是否需要初始化
export const shouldSeedDatabase = async () => {
  try {
    const userCount = await Users.countDocuments();
    return userCount === 0; // 如果用户数为0则初始化
  } catch (error) {
    console.error('Error checking database status:', error);
    return false;
  }
};