const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schema.js');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage});


//Models
const Campground = require('../models/campground');

//error handlers
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


router.route('/')
    //show all campgrounds
    .get(catchAsync(campgrounds.index))
    //Create campground post route
    .post(isLoggedIn, 
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.createCampgrounds));
    
//Create campground get route
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    //show detail page
    .get(catchAsync(campgrounds.showCampground))
    //Edit a campground put route
    .put(isLoggedIn,
        isAuthor,  
        upload.array('image'),
        validateCampground, 
        catchAsync(campgrounds.updateCampground))
    //delete a campground route
    .delete(isLoggedIn, 
        isAuthor, 
        catchAsync(campgrounds.deleteCampground));

//Edit a campground get route
router.get('/:id/edit', 
    isLoggedIn, 
    isAuthor, 
    catchAsync(campgrounds.renderEditForm));


module.exports = router