const mongoose = require('mongoose');
const arr = require('./city');
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!!!")
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)

        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            author: '620f748ef225b4c08fcf4de8',
            location: `${arr[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cupiditate fugit volu ptatem enim obcaecati qui voluptates aut. Hic eius eum atque ipsa illo porro quos? Officia quae adipisci iusto blanditiis voluptatem. Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, molestiae. Suscipit delectus, ipsum excepturi veniam qui dolores dicta, unde omnis consequatur similique voluptatum illo quae voluptate quia, quod provident consectetur.',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                    arr[random1000].longitude,
                    arr[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dm3rz9esz/image/upload/v1645600697/YelpCamp/gg7ovxlzseuljajqxfup.jpg',
                    filename: 'YelpCamp/w4xp9o9vbb3to3ja6foi',
                },
                {
                    url: 'https://res.cloudinary.com/dm3rz9esz/image/upload/v1645458932/YelpCamp/kzotruhseztl3asaaacn.jpg',
                    filename: 'YelpCamp/kzotruhseztl3asaaacn',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});


//'https://source.unsplash.com/collection/483251/1600x900'