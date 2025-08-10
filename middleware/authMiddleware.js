// 检查用户是否已登录
export const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    
    // 存储原始请求URL以便登录后重定向
    req.session.returnTo = req.originalUrl;
    
    req.flash('error', 'Please log in to access this page');
    res.redirect('/login');
  };
  
  // 检查用户是否是管理员
  export const isManager = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'manager') {
      return next();
    }
    
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/');
  };
  
  // 检查用户是否拥有评论
  export const isReviewOwner = async (req, res, next) => {
    try {
      const reviewId = req.params.id;
      const userId = req.session.user._id;
      
      const review = await Review.findOne({
        _id: reviewId,
        guestId: userId
      });
      
      if (!review) {
        req.flash('error', 'You are not authorized to modify this review');
        return res.redirect('/profile/reviews');
      }
      
      next();
    } catch (error) {
      console.error('Review owner check error:', error);
      res.status(500).render('errors', {
        title: 'Server Error',
        errorCode: 500,
        errorMessage: 'Authorization check failed'
      });
    }
  };