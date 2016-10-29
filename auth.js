// appID = 801111623364782
//appSecret = 937cdcbb2f8b3506dc2ac0be7bcbb800
              

function setupAuth(User, app) {
    var passport = require('passport');
    var FacebookStrategy = require('passport-facebook').Strategy;
    var FACEBOOK_CLIENT_ID = "801111623364782";
    var FACEBOOK_CLIENT_SECRET = "937cdcbb2f8b3506dc2ac0be7bcbb800";

    //High level serialize/de-serialize configuration for passport
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.
         findOne({_id: id}).
         exec(done);
    });

    //Facebook-specific
    passport.use( new FacebookStrategy(
        {
            "clientID": FACEBOOK_CLIENT_ID, //process.env.FACEBOOK_CLIENT_ID,
            "clientSecret": FACEBOOK_CLIENT_SECRET, //process.env.FACEBOOK_CLIENT_SECRET,
            "callbackURL": "http://localhost:3131/auth/facebook/callback",
            "profileFields": ["id", "birthday", "email", "first_name", "gender", "last_name"]
        },
        function(accessToken, refreshToken, profile, done) {
            if (!profile.emails || !profile.emails.length) {
                return done('<<No emails associated with this account!!>>');
            }
            process.nextTick(function () {
                //return done(null, profile);
//            });

            
                //console.log(profile);
            User.findOneAndUpdate(
                { 'data.oauth': profile.id},
                {
                    $set: {
                        'profile.username': profile.emails[0].value,
                        'profile.picture': 'http://graph.facebook.com/' +
                        profile.id.toString() + '/picture?type=large'
                    }
                },
                { 'new': true, upsert: true, runValidators: true },
                function(error, user) {
                    done(error,user);    
            });
        }); 
    }));

    //Express Middleware for auth`
    app.use(require('express-session')({    
        secret: 'this is a secret'
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    //Express routes for auth
    app.get('/auth/facebook',
      passport.authenticate('facebook', {scope: ['email'] }),
            function(req, res) {
            });

      app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {failuerRedirect: '/fail' }),
        function(req, res) {
            res.send('Welcome, '+ req.user.profile.username);
        });
}

module.exports = setupAuth;