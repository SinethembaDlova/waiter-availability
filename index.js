// Requiring all my dependencies
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');
//require mangoose and create a database that takes strings
var mongoose = require('mongoose');
const mongoURL = process.env.MONGO_DB_URL || "mongodb://localhost/waiter_availability";

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
    workingDays: []

});

//Avoiding duplicates in waiter Schema
WaiterSchema.index({
    username: 1
}, {
    unique: true
});

//Creating a model for my database
var WaiterAvailability = mongoose.model('WaiterAvailability', WaiterSchema);


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
app.get('/', function(req, res) {
    WaiterAvailability.find({}, function(err, site) {
        if (err) {
            console.log(err);
        } else {
            res.render('home')
        }
    })

});


//login routes
app.get('/signup', function(req, res) {
    WaiterAvailability.find({}, function(err, site) {
        if (err) {
            console.log(err);
        } else {
            res.render('signup')
        }
    })

});


app.post('/signup', function(req, res) {
    var name = req.body.name;
    var passkey = req.body.passkey;
    var confirmPasskey = req.body.confirmPasskey;

    var user = new WaiterAvailability({
        username: name,
        password: passkey
    })

    if (passkey != confirmPasskey) {
        req.flash('error', 'Please enter the same password');
        res.redirect('/signup');
    } else {
        user.save(function(err, allUsers) {
            if (err) {
                if (err.code === 11000) {
                    req.flash('error', 'This user already exists!');
                    res.redirect('/signup');
                }
            } else {
                console.log(allUsers);
                req.flash('success', 'User successfully added to the database. Please login')
                res.redirect('/login');
            }
        })
    }
});

//login routes
app.get('/login', function(req, res) {
    WaiterAvailability.find({}, function(err, site) {
        if (err) {
            console.log(err);
        } else {
            res.render('login')
        }
    })

});


app.post('/login', function(req, res) {
    var name = req.body.name;
    var passkey = req.body.passkey;

    WaiterAvailability.find({}, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            if (name === "Admin" && passkey === "admin") {
                res.redirect('/admin/days')
            } else {
                res.redirect('/waiter/' + name);
            }
        }
    })
});


//waiters routes
app.get('/waiter/:username', function(req, res) {
    var waiter = req.params.username;
    var shiftDays = req.body.day;

    WaiterAvailability.findOne({
        username: waiter
    }, function(err, shiftDays) {

        var shiftMap = {};

        for (var i = 0; i < shiftDays.workingDays.length; i++) {
            if (shiftMap[shiftDays.workingDays[i]] === undefined) {
                shiftMap[shiftDays.workingDays[i]] = "active"
            }
        }
        console.log(shiftMap);

        if (err) {
            console.log(err);
        } else {
            res.render('waiter', {
                username: waiter,
                shiftDays: shiftMap
            })
        }
    });

});


app.post('/waiter/:username', function(req, res) {
    var waiter = req.params.username;
    var shiftDays = req.body.day;
    console.log(waiter);
    console.log(shiftDays);

    WaiterAvailability.findOne({
        username: waiter
    }, function(err, theUser) {
        if (err) {
            console.log(err);
        } else {
            console.log("********");
            console.log(theUser);
            theUser.workingDays = shiftDays;
            theUser.save({}, function(err, updatedUser) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(updatedUser);
                    console.log("********");
                    res.redirect('/waiter/' + updatedUser.username);
                }
            })
        }
    })
});


//admin's view
app.get('/admin/days', function(req, res) {
    // List all names that work days shift
    var mondayShift = [];
    var tuesdayShift = [];
    var wednesdayShift = [];
    var thursdayShift = [];
    var fridayShift = [];
    var saturdayShift = [];
    var sundayShift = [];

    WaiterAvailability.find({}, function(err, db) {
        if (err) {
            console.log(err);
        } else {
            //console.log(db);
        }
    }).then(function(db) {
        for (var i = 0; i < db.length; i++) {
            var roaster = db[i].workingDays;
            //      console.log(roaster);
            var workingWaiter = db[i].username;
            //    console.log(workingWaiter);

            for (var ii = 0; ii < roaster.length; ii++) {
                console.log("*************");
                if (roaster[ii] === 'Monday') {
                    mondayShift.push(workingWaiter);
                    console.log(mondayShift);
                } else if (roaster[ii] === 'Tuesday') {
                    tuesdayShift.push(workingWaiter);
                    console.log("tue" + tuesdayShift);
                } else if (roaster[ii] === 'Wednesday') {
                    wednesdayShift.push(workingWaiter);
                    console.log("wed" + wednesdayShift);
                } else if (roaster[ii] === 'Thursday') {
                    thursdayShift.push(workingWaiter);
                    console.log("thur" + thursdayShift);
                } else if (roaster[ii] === 'Friday') {
                    fridayShift.push(workingWaiter);
                    console.log("fri" + fridayShift);
                } else if (roaster[ii] === 'Saturday') {
                    saturdayShift.push(workingWaiter);
                    console.log(saturdayShift);
                } else {
                    sundayShift.push(workingWaiter);
                    console.log(sundayShift);
                }
            }
        }
        res.render('admin', {
            mondayNames: mondayShift,
            tuesdayNames: tuesdayShift,
            wednesdayNames: wednesdayShift,
            thusdayNames: thursdayShift,
            fridayNames: fridayShift,
            saturdayNames: saturdayShift,
            sundayNames: sundayShift
        });
    })
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
