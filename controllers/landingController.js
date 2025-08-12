import Property from '../models/Property.js';
import Reviews from '../models/Reviews.js';

import xss from 'xss';

export const getLandingPage = async (req, res) => {
//   try {
//     const featured = await Property.find().sort({ rating: -1 }).limit(5).lean();

// for (let f of featured) {
//       const reviews = await Reviews.find({ listingId: f._id }).lean();
//       if (reviews.length > 0) {
//         let avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
//         f.averageRating = Math.round(avg * 10) / 10;
//       } else {
//         f.averageRating = 0;
//       }
//     }
  try {
    const featured = await Property.find().lean();  // 获取所有物业
    for (let f of featured) {
      const reviews = await Reviews.find({ listingId: f._id }).lean();
      if (reviews.length > 0) {
        let avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        f.averageRating = Math.round(avg * 10) / 10;
      } else {
        f.averageRating = 0;
      }
    }

    // 根据 averageRating 排序
    featured.sort((a, b) => b.averageRating - a.averageRating);  // 从高到低排序

        const topFeatured = featured.slice(0, 5);  // 获取前5个

    //dynamic city list
    const cities = await Property.distinct("city");

    return res.render('landing', { featured: topFeatured, title: 'BNB Advisor', cityList: cities });
  } catch (err) {
    return res.status(500).render("error", {
      title: "Error",
      message: "Something went wrong. Please try again later.",
      isNotFound: false
    });
  }
};

export const getListings = async (req, res) => {
  try {
    const keyword = xss(req.query.keyword || '').trim();
    const city = xss(req.query.city || '').trim();


    //no null validation
    if (!keyword && !city) {
      return res.status(400).render('error', {
        title: 'Invalid Input',
        message: 'Please enter a search keyword or select a city.',
        isNotFound: false
      });
    }

    //keyword no all digital validation
    if (keyword && /^\d+$/.test(keyword)) {
      return res.status(400).render('error', {
        title: 'Invalid Keyword',
        message: 'Keyword cannot be only numbers.',
        isNotFound: false
      });
    }

    const filter = {};
    if (keyword) {
      filter.title = { $regex: keyword, $options: 'i' };
    }
    if (city) {
      filter.city = city;
    }


   const results = await Property.find(filter).lean();

for (let property of results) {
  const reviews = await Reviews.find({ listingId: property._id }).lean();
  property.reviews = reviews; // 给模板用
}

    if (results.length === 0) {
      return res.status(404).render('error', {
        title: 'No BNBs Found',
        message: 'Sorry, no BNB matched your search.',
        isNotFound: true
      });
    }


    return res.render('listings', {
      results,
      title: 'Search Result'
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Server Error',
      message: 'Something went wrong. Please try again later.',
      isNotFound: false
    });
  }
};