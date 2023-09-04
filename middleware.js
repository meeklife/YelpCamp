const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schema.js');
const Review = require('./models/review');
const { reviewSchema } = require('./schema.js');


//Authentication middleware
module.exports.isLoggedIn = (req, res, next)=>{
    if (!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in first')
        return res.redirect('/login')
    }
    next() 
}

//Authorization middleware
module.exports.isAuthor = async (req, res, next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do this')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

//JOI Schema Validated for Campground
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//Authorization for Reviews
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that');
      return res.redirect(`/campgrounds/${id}`); 
    }
    next();
};

//JOI Schema Validated for Reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// module.exports.storeReturnTo = (req, res, next)=>{
//     if (req.session.returnTo){
//         res.locals.returnTo = req.session.returnTo
//     }
//     next()
// }