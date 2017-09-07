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
                req.flash('success', 'User successfully added to the database. Please login');
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
                    req.flash('success', 'Your working days are successfully updated.')
                    res.redirect('/waiter/' + updatedUser.username);
                }
            })
        }
    })
});

//changing the background color of the block, depending on the conditions.
function dayBlockStyle(waiterCount) {
    if (waiterCount === 3) {
        return "bg-success";
    } else if (waiterCount > 3) {
        return "bg-warning";
    } else {
        return "bg-danger";
    }
}

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
                if (roaster[ii] === 'Monday') {
                    mondayShift.push(workingWaiter);
                } else if (roaster[ii] === 'Tuesday') {
                    tuesdayShift.push(workingWaiter);
                } else if (roaster[ii] === 'Wednesday') {
                    wednesdayShift.push(workingWaiter);
                } else if (roaster[ii] === 'Thursday') {
                    thursdayShift.push(workingWaiter);
                } else if (roaster[ii] === 'Friday') {
                    fridayShift.push(workingWaiter);
                } else if (roaster[ii] === 'Saturday') {
                    saturdayShift.push(workingWaiter);
                } else {
                    sundayShift.push(workingWaiter);
                }
            }
        }
        res.render('admin', {
            mondayNames: mondayShift,
            mondayCounter: mondayShift.length,
            mondayStyle: dayBlockStyle(mondayShift.length),
            tuesdayNames: tuesdayShift,
            tuesdayCounter: tuesdayShift.length,
            tuesdayStyle: dayBlockStyle(tuesdayShift.length),
            wednesdayNames: wednesdayShift,
            wednesdayCounter: wednesdayShift.length,
            wednesdayStyle: dayBlockStyle(wednesdayShift.length),
            thursdayNames: thursdayShift,
            thursdayCounter: thursdayShift.length,
            thursdayStyle: dayBlockStyle(thursdayShift.length),
            fridayNames: fridayShift,
            fridayCounter: fridayShift.length,
            fridayStyle: dayBlockStyle(fridayShift.length),
            saturdayNames: saturdayShift,
            saturdayCounter: saturdayShift.length,
            saturdayStyle: dayBlockStyle(saturdayShift.length),
            sundayNames: sundayShift,
            sundayCounter: sundayShift.length,
            sundayStyle: dayBlockStyle(sundayShift.length)
        });
    })
});

//Create a route that will reset the roaster for next week.

app.get('/reset/roaster', function(req, res) {
    WaiterAvailability.find({}, function(err, db) {
        if (err) {
            console.log(err);
        }
        else {
          console.log(db);
          db.forEach(function(data){
              data.workingDays = [];
              data.save();
          })

          res.redirect('/admin/days')
          // console.log(db);
          // .save({workingDays: {}}, function(err, updatedDb) {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     console.log(updatedDb);
          //   }
          // });

        }
      });
    // }).then(function(db) {
    //     doc.name = doc.name.replace(/&nbsp;/g,"");
    //     db.tests.update({ "_id": doc._id },{ "$set": { "name": doc.name } });
    //
    //
    //     // for (var i = 0; i < db.length; i++) {
    //     //     db[i].workingDays = [];
    //     // }
    //     //    console.log(db);
    //
    //     console.log('updating...1');
    //
    //
    //     db.save({}, function(err, updatedDb) {
    //         console.log('updating...2');
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log("data saved in the DB");
    //             res.redirect('/admin/days')
    //         }
    //     });

})

//when my server running go to ports 3001 or any available port
const port = process.env.PORT || 3001;
app.listen(port, function(err) {
    if (err) {
        return err;
    } else {
        console.log('server running on port 3001');
    }
});
