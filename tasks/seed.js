import mongoose from 'mongoose';
import Property from '../models/Property.js';
import Reviews from '../models/Review.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/mydb';

const cities = ['Beijing', 'Tokyo', 'New York', 'Los Angeles'];

const sampleProperties = [
  'Sunny Beach House',
  'Mountain Cabin Retreat',
  'Modern City Apartment',
  'Cozy Countryside Cottage',
  'Luxury Downtown Condo',
  'Charming Suburban Home',
  'Rustic Lakeside Lodge',
  'Minimalist Studio Loft',
  'Historic Townhouse',
  'Eco-Friendly Villa'
];

const sampleAmenities = [
  'WiFi', 'Air Conditioning', 'Heating', 'Kitchen',
  'Washer', 'Dryer', 'Free Parking', 'Pool'
];

const sampleReviews = [
  { author: 'Alice', rating: 5, comment: 'Amazing place! Very clean and comfortable.' },
  { author: 'Bob', rating: 4, comment: 'Great location, but a bit noisy at night.' },
  { author: 'Charlie', rating: 3, comment: 'Average stay, could be cleaner.' },
  { author: 'Diana', rating: 5, comment: 'Absolutely perfect! Highly recommend.' },
  { author: 'Ethan', rating: 4, comment: 'Nice house, friendly host.' },
  { author: 'Fiona', rating: 2, comment: 'Not worth the price.' },
  { author: 'George', rating: 5, comment: 'The view was breathtaking!' },
  { author: 'Hannah', rating: 4, comment: 'Loved the decor and atmosphere.' },
  { author: 'Ivan', rating: 3, comment: 'Decent stay, but needs renovation.' },
  { author: 'Judy', rating: 5, comment: 'Spotlessly clean and cozy.' },
  { author: 'Kevin', rating: 4, comment: 'Good amenities and location.' },
  { author: 'Laura', rating: 3, comment: 'Expected more for the price.' },
  { author: 'Mike', rating: 5, comment: 'Fantastic host and property.' },
  { author: 'Nina', rating: 4, comment: 'Peaceful and relaxing.' },
  { author: 'Oscar', rating: 2, comment: 'Uncomfortable bed.' },
  { author: 'Paula', rating: 5, comment: 'Everything was perfect!' },
  { author: 'Quinn', rating: 3, comment: 'Average, nothing special.' },
  { author: 'Ryan', rating: 4, comment: 'Convenient location.' },
  { author: 'Sophie', rating: 5, comment: 'Beautiful and luxurious stay.' },
  { author: 'Tom', rating: 3, comment: 'It was okay.' }
];

async function seed() {
  try {
    console.log('=== Running seed.js ===');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB');

    await Property.deleteMany({});
    await Reviews.deleteMany({});
    console.log('🗑 Cleared old data');

    // 创建 10 个 property
    const properties = [];
    for (let i = 0; i < sampleProperties.length; i++) {
      const property = new Property({
        title: sampleProperties[i],
        city: cities[Math.floor(Math.random() * cities.length)],
        address: `Address ${i + 1}`,
        pricePerNight: Math.floor(Math.random() * 300) + 50,
        bedrooms: Math.floor(Math.random() * 5) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        amenities: sampleAmenities.sort(() => 0.5 - Math.random()).slice(0, 4),
        description: `Description for ${sampleProperties[i]}`,
        averageRating: 0
      });
      await property.save();
      properties.push(property);
    }
    console.log(`🏠 Created ${properties.length} properties`);

    // 随机选 7 个 property 有 review
    const reviewedProps = properties
      .sort(() => 0.5 - Math.random())
      .slice(0, 7);

    const reviewsToInsert = [];

    for (let r of sampleReviews) {
      const targetProperty = reviewedProps[Math.floor(Math.random() * reviewedProps.length)];
      reviewsToInsert.push({
        listingId: targetProperty._id,
        author: r.author,
        rating: r.rating,
        comment: r.comment,
        likes: Math.floor(Math.random() * 10)
      });
    }

    await Reviews.insertMany(reviewsToInsert);
    console.log(`📝 Inserted ${reviewsToInsert.length} reviews`);

    // 计算并更新 averageRating
    const avgRatings = await Reviews.aggregate([
      {
        $group: {
          _id: '$listingId',
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    for (let entry of avgRatings) {
      await Property.findByIdAndUpdate(entry._id, {
        averageRating: parseFloat(entry.avgRating.toFixed(1))
      });
    }

    // 更新完后，按评分降序排序
    const sortedProperties = await Property.find().sort({ averageRating: -1 });

    console.log('⭐ Average ratings updated');
    console.log('🌱 Seed completed successfully');

    // 打印排序后的 property
    console.log('Sorted Properties (by rating):');
    sortedProperties.forEach((property) => {
      console.log(`${property.title} - Rating: ${property.averageRating}`);
    });

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();