// =======================
// get the packages we need ============
// =======================
var express     = require('express'); //Acts as a Web Server
var app         = express();
var bodyParser  = require('body-parser'); //To parse HTTP Post
var morgan      = require('morgan'); //Show output in console
var mongoose    = require('mongoose'); //MongoDB connector
var nodemailer  = require('nodemailer'); //SMTP Mail
var fs		= require('fs'); // reading SSL Certs
var https	= require('https'); // Enable Web Server over HTTPS

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model

var privateKey  = fs.readFileSync('sslcert/mailbot.key', 'utf8');
var certificate = fs.readFileSync('sslcert/mailbot.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtp://localhost');

// =======================
// configuration =========
// =======================

var port = process.env.PORT || 443; // used to create, sign, and verify tokens
var handle = process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console

app.use(morgan('dev'));

// =======================
// routes ================
// =======================


// basic route
app.get('/', function(req, res) {
    res.json({ 
		status: 'listening', 
		message: 'authenticate to proceed' 
		});
});

// API ROUTES -------------------
// '/setup' can be removed after adding the user in mongoDB
app.get('/setup', function(req, res) {

  // create a sample user
  var nick = new User({
    name: 'mailAdmin',
    password: 'm@!lb0t',
    admin: true
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router();

// TODO: route to authenticate a user (POST https://localhost:443/api/authenticate)
// get an instance of the router for api routes
// var apiRoutes = express.Router();

// route to authenticate a user (POST https://localhost:443/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn : 60 // expires in 60 Seconds
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }

    }

  });
});

// route middleware to verify a token

apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route to show a random message (GET https://localhost:443/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET https://localhost:443/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

apiRoutes.post('/sendMail', function(req, res) {
  var mailOptions = req.body.mailOptions || {
      from: req.body.from, // sender address
      to: req.body.to, // list of receivers
      subject: req.body.subject, // Subject line
      cc: req.body.cc, // list of cc
      replyTo: req.body.replyTo, // Reply to
//      text: req.body.text, // plaintext body
      html: req.body.html // html body
      };
  transporter.sendMail(mailOptions, function(err, info){
      if (err ){
         console.log(err);
         res.status(500);
         res.json({ status: 'Mail not sent', message: err });
      }
      else {
         console.log('E-mail sent: ' + info.response);
         res.status(200);
         res.json({ status: 'Mail sent successfully', message: info });
      }
    });
});
// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
//app.listen(port);
httpsServer.handle;
httpsServer.listen(port);
console.log('Magic happens at https://localhost:' + port);
