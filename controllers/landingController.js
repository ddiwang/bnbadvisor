import Property from '../models/Property.js';
import Reviews from '../models/Reviews.js';


import xss from 'xss';

export const getLandingPage = async (req, res) => {
  try {
    const featured = await Property.find().sort({ rating: -1 }).limit(5);
    //dynamic city list
    const cities = await Property.distinct("city");
    console.log(cities);

    return res.render('landing', { featured, title: 'BNB Advisor', cityList: cities });
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


    const results = await Property.find(filter);


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


export const getId = async (req, res) => {
    try {
      const { id } = req.params;
      
      // 获取房源详情
      const bnb = await Property.findOne({ _id: id });
      
      if (!bnb) {
        return res.status(404).render('error', {
          title: 'Not Found',
          errorCode: 404,
          errorMessage: 'Property not found'
        });
      }
      
      // 获取相关评论
      const bnbReviews = await Reviews.find({ listingId: bnb._id })
        .sort({ createdAt: -1 });
      
      // 计算平均评分
      let averageRating = 0;
      if (bnbReviews.length > 0) {
        const totalRating = bnbReviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / bnbReviews.length;
      }
      
      // 获取3条最新评论
      const recentReviews = bnbReviews.slice(0, 3);
      
      res.render('bnbs', {
        title: bnb.title,
        bnb: {
          ...bnb,
          averageRating: parseFloat(averageRating.toFixed(1))
        },
        recentReviews,
        reviewCount: bnbReviews.length
      });
    } catch (error) {
      console.error('BNB details error:', error);
      res.status(500).render('error', {
        title: 'Server Error',
        errorCode: 500,
        errorMessage: 'Failed to load property details'
      });
    }
  };