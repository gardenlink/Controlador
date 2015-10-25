module.exports = function(app, config,passport,util,TwitterStrategy,auxiliares){

//Por defecto
app.get('/', ensureAuthenticated, function(req, res){
  res.render('index', { user: req.user });
});


//Codigo para autenticar con Twitter

// GET /auth/twitter
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Twitter authentication will involve redirecting
//   the user to twitter.com.  After authorization, the Twitter will redirect
//   the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });

// GET /auth/twitter/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/logs',function(req,res){
  res.render('logs');
});

app.get('/graficos', function(req,res){
  res.render('graficos');
});


function ensureAuthenticated(req, res, next) {
  var ipCliente = auxiliares.ObtenerIpCliente(req);
  //si proviene de una llamada interna lo debo dejar pasar.
  if (ipCliente == '127.0.0.1' || ipCliente == IPAddress)
  {
    //console.log("Llamada de cliente desde ip interna : " + ipCliente);  
     return next(); 
  }
  else
  {
    //console.log("Llamada de cliente desde ip externa : " + ipCliente);

    if (config.twitter_autenticacion == "true") 
  { 
    if (req.isAuthenticated())
      return next(); 
  }
  else
  {
    return next(); 
  }

  res.render('index', { user: null });
  }
  
  
}



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Twitter profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the TwitterStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Twitter profile), and
//   invoke a callback with a user object.
passport.use(new TwitterStrategy({
    consumerKey: config.twitter_consumer_key,
    consumerSecret: config.twitter_consumer_secret,
    callbackURL: config.twitter_callback_url
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Twitter profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Twitter account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




};