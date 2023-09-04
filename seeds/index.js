const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

//creating camps 
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '64e0654ba36bf746b977f29c',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Great Description for campgrounds',
            price,
            geometry: { 
                type : "Point", 
                coordinates : [ 
                        cities[random1000].longitude,
                        cities[random1000].latitude 
                ] 
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dskyhbpb2/image/upload/v1693425369/YelpCamp/ghana_lbapkn.avif',
                  filename: 'YelpCamp/tghqdbujqeczirdjved8',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});