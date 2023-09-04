const express = require('express');
const router = express.Router();
const { reviewSchema } = require('../schema.js');
const Review = require('../models/review');
const Campground = require('../models/campground');
const {isLoggedIn, isReviewAuthor, validateReview} = require('../middleware')
const reviews = require('../controllers/reviews')

//error handlers
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

//creating a review 
router.post('/campgrounds/:id/reviews', isLoggedIn, validateReview,  catchAsync(reviews.createReview))

//deleting a review
router.delete('/campgrounds/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router