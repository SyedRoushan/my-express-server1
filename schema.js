const mongoose = require('mongoose');

const covidSchema =  new mongoose.Schema({
    date: String,
    state: String,
    cases: Number,
    deaths: Number
});

export default covidSchema;