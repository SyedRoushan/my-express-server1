//Requiring Express
const express = require('express');

//Requiring Mongoose
const mongoose = require('mongoose');

//Requiring cors for enabling cross communication between ports
var cors = require('cors');

//Setting app as express
const app = express();

//Defining App to use express
app.use(express.json({extended: true}));

//Defining App to use cors
app.use(cors());

//Establishing the connection with the database
mongoose.connect("mongodb://localhost:27017/coviddata", {useNewUrlParser: true, useUnifiedTopology: true});

//Creating a Schema model for the data to be stored in the MongoDB database
const covidSchema =  new mongoose.Schema({
    date: String,
    state: String,
    cases: Number,
    deaths: Number
});

//Creating a collection in the mongoDb data base with the codidSchema
const Covid = mongoose.model("Covid-data", covidSchema);

// const row = new Covid({
//     date: "07/01/1999",
//     state: "Telangana",
//     cases: 0,
//     deaths: 0
// });

// row.save();

//Initializing the server on port 4000
app.listen(4000, () => {console.log("server started on port 4000")});

//Defining the POST method to route "/post" for adding data to the Database 
app.post("/post", (req, res) => {

    const {date, state, cases, deaths} = req.body;

    const row = new Covid({
        date: date,
        state: state,
        cases: cases,
        deaths: deaths
    });
    console.log(req.body);

    //Calling the save method of mongoose to save the data to the database
   row.save((err, result) => {
       if(err){
           console.log(err);
       }else{
           console.log(result);
           //Sending the obtained result to the client
           res.send(result);
       }
   });
});

//Defining the POST method to route "/get/state" for getting state specific data to the Database
app.post("/get/state", (req, res) => {

    //Calling the find method of mongoose with state as a filtering parameter
    Covid.find({ state: req.body.state}, (err, data) => {
        if(err){
            console.log(err);
        }else{
            console.log(data);
            var cases = 0;
            var deaths = 0;
            data.forEach(item => {cases += item.cases; deaths += item.deaths});
            console.log("State: " + req.body.state + " Cases: " + cases + " Deaths: " + deaths);
            //Sending the obtained result to the client
            res.send("Cases: " + cases + "  Deaths: " + deaths );
        }
    });
});

//Defining the POST method to route "/delete" for deleting state specific data from the Database 
app.post("/delete", (req, res) => {
    console.log(req.body.state);
    //Calling the deleteMany method of mongoose for deleting state specific data from the Database with state as a filtering parameter
    Covid.deleteMany({state: req.body.state}, (err, data) =>{
        if(err){
            console.log(err);
        }else{
            console.log(data);
            //Sending the obtained result to the client
            res.send(`Deleted ${data.deletedCount} Records for state: ${req.body.state}`);
        }
    });
});

//Defining the POST method to route "/date/state" for getting data from the Database with a specific date and state
app.post("/date/state", (req, res) => {

    console.log(req.body);
    //Calling the find method of mongoose to get the data from the database with state and date as filtering parameters
    Covid.find({ date: req.body.date, state: req.body.state}, (err, data) =>{
        if(err){
            console.log(err);
        }else{
            //Sending the first 20 documents from the obtained result to the client
            res.send(data.slice(0,20));
        }
    });
});

//Defining the POST method to route "/date/case" for getting state data from the Database surpassing the cases threshold
app.post("/date/case", (req, res) => {

    //Calling the find method of mongoose to get the data from the database
    Covid.find({cases: {$gt: req.body.cases}}, (err, data) => {
        if(err){
            console.log(err);
        }else{
            //calculating the states with cases more than given in a single day
            var result = [];
            for(var i = 0; i < data.length; i++){
                var cases = 0;
                for(var j = 0; j < data.length; j++){
                    if(data[i].date === data[j].date && data[i].state === data[j].state){
                        cases += data[j].cases;
                    }
                }
                console.log(`date: ${data[i].date} state: ${data[i].state} cases: ${cases}`);
                result.push(data[i]);
            }
            //Sending the obtained result to the client
            res.send(result);
            console.log(result);
        }
    });
});