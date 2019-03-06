const passport = require('../Scripts/expressDados').passport;

module.exports = {
    UserRoutes: (app, session, db) => {
        function isLoggedIn(req, res, next) {
            // Função que permite garantir que 
            // o utilizador esta autenticado.

            var logOut =
                (req, res) => {
                    if (req.session !== undefined) {
                        req.session.destroy(function (err) {
                            if (err) {
                                console.log(err);
                                res.json(JSON.stringify({ success: false }));
                            } else {
                                req.logout();
                                res.json(JSON.stringify({ success: false }));
                            }
                        })
                    } else {
                        req.logout();
                        res.json(JSON.stringify({ success: false }));
                    }
                };

            if (session.GetSession() !== undefined) {
                if (session.GetSession()._id !== undefined) {
                    passport.deserializeUser(session.GetSession()._id, (err, user) => {
                        if (err) {
                            logOut(req, res);
                        }

                        req.user = user;

                        if (req.isAuthenticated())                                              // Se estiver autenticado corre a
                            return next();                                                      // proxima função
                    });
                } else {
                    logOut(req, res);
                }
            } else {
                logOut(req, res);
            }
        };

        app.post('/logout', function (req, res) {
            req.session.destroy(function (err) {
                if (err) {
                    console.log(err)
                    res.json(JSON.stringify({ success: false }));
                } else {
                    req.logout();
                    res.redirect('/Logout');
                }
            });
        });

        app.get('/islogged', (req, res) => {
            if (session.GetSession() !== undefined) {
                if (session.GetSession()._id !== undefined) {
                    db.User.findUser(req.body.username, (err, usr) => {
                        if (err) {
                            console.log(err);
                            res.json(JSON.stringify({ isLoggedIn: false }));
                        }
                        passport.deserializeUser(session.GetSession()._id, (err, user) => {
                            if (err) {
                                res.json(JSON.stringify({ isLoggedIn: false }));
                            }

                            if (usr.username === user.username)
                                res.json(JSON.stringify({ isLoggedIn: true }));
                        });
                    })
                } else {
                    res.json(JSON.stringify({ isLoggedIn: false }));
                }
            } else {
                res.json(JSON.stringify({ isLoggedIn: false }));
            }
        })

        app.post('/login', passport.authenticate('local-login'), function (req, res) {
            req.logIn(req.user, function (err) {
                if (err) {
                    console.log(err)
                    res.json(JSON.stringify({ success: false }));
                }

                if (req.session.passport.user !== undefined) {
                    if (session.GetSession() === undefined) {
                        var sess = req.session;
                        sess._id = req.session.passport.user;
                    } else {
                        var sess = session.GetSession();
                        sess._id = req.session.passport.user;
                    }

                    session.UpdateSession(sess);
                    session.GetSession().save();
                }
                res.json(JSON.stringify({ User: req.user, Error: req.user.errors }));
            });
        });


        app.post('/signup',
            passport.authenticate('local-signup'), function (req, res) {
                req.logIn(req.user, function (err) {
                    if (err) {
                        console.log(err)
                        res.json(JSON.stringify({ success: false }));
                    }

                    if (req.session.passport.user !== undefined) {
                        if (session.GetSession() === undefined) {
                            var sess = req.session;
                            sess._id = req.session.passport.user;
                        } else {
                            var sess = session.GetSession();
                            sess._id = req.session.passport.user;
                        }

                        session.UpdateSession(sess);
                        session.GetSession().save();
                    }

                    res.json(JSON.stringify({ User: req.user, success: true }));
                });
            });

        app.get('/profile', isLoggedIn, (req, res) => {
            db.findUser(req.user.username, (err, user) => {
                if (err) {
                    console.log(err)
                    res.json(JSON.stringify({ success: false }));
                }

                res.json(JSON.stringify({ user, success: true }));
            });
        });

        app.put('/profile/edit', isLoggedIn, function (req, res) {
            var profile = {};

            if (req.body.username)
                profile.username = req.body.username;
            else
                profile.username = req.user.username;

            if (req.body.password)
                profile.password = db.UserSchema.methods.generateHash(req.body.password);
            else
                profile.password = req.user.password;

            if (req.body.firstName)
                profile.firstName = req.body.firstName;
            else
                profile.firstName = req.user.firstName;

            if (req.body.lastName)
                profile.lastName = req.body.lastName;
            else
                profile.lastName = req.user.lastName;

            if (req.body.email)
                profile.email = req.body.email;
            else
                profile.email = req.user.email;

            if (req.body.picurl)
                profile.picurl = req.body.picurl;
            else
                profile.picurl = req.user.picurl;

            if (Object.keys(profile).length) {
                db.updateUser(req.user.id, profile);
                res.json(JSON.stringify({ success: true }));
            } else {
                res.json(JSON.stringify({ success: false }));
            }
        });

        app.delete('/profile/del', isLoggedIn, function (req, res) {
            db.deleteUsername(req.user.username);
            req.session.destroy(function (err) {
                if (err) {
                    console.log(err)
                    res.json(JSON.stringify({ success: false }));
                } else {
                    req.logout();
                    res.json(JSON.stringify({ success: true }));
                }
            });
        });
    }
}