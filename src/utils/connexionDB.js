const mongoose = require('mongoose')
const url = 'mongodb://127.0.0.1:27017/'

async function connectDb() {
    await mongoose.connect(url);
    console.log('DB connected succesfully!');
}

module.exports = {
    connectDb
}
