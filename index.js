// Requiring all my dependencies
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');
//require mangoose and create a database that takes strings
var mongoose = require('mongoose');
const mongoURL = process.env.MONGO_DB_URL || "mongodb://localhost/registration_numbers";

var app = express();

mongoose.connect(mongoURL);

//creating a schema for waiter availability
var WaiterSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        sparse: true
    },

    password: String,
    workingDays: [];

});

//Avoiding duplicates in waiter Schema
WaiterSchema.index({
    username: 1
}, {
    unique: true
});

//Creating a model for my database
var WaiterAvailability = mongoose.model('WaiterAvailability',WaiterSchema);


app.engine('hbs', exphbs({
    defaultLayout: "main",
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'keyboard cat',
    cookie: {
        maxAge: 6000 * 30
    }
}));
app.use(flash());

//Home routes
app.get('/', function(req,res){


});


app.post('/', function(req,res){

});

//login routes
app.get('/login', function(req,res){


});


app.post('/login', function(req,res){

});

//waiters routes
app.get('/waiters/:username', function(req,res){


});


app.post('/waiters/:username', function(req,res){

});

app.get('/admin/days', function(req,res){


});


//when my server running go to ports 3001 or any available port
const port = process.env.PORT || 3001;

app.listen(port, function(err) {
    if (err) {
        return err;
    } else {
        console.log('server running on port 3001');
    }
});
