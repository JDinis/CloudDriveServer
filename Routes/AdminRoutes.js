const multiparty = require('multiparty'),
    fs = require('fs'),
    path = require('path'),
    passport = require('../Scripts/expressDados').passport,
    zip = require('zip-a-folder');

module.exports = {
    AdminRoutes: (app, session, db) => {
        function isLoggedIn(req, res, next) {
            // Função que permite garantir que 
            // o utilizador esta autenticado.

            var logOut =
                (req, res) => {
                    if (req.session !== undefined) {
                        req.session.destroy(function (err) {
                            if (err) {
                                console.log(err);
                                res.json({ success: false });
                            } else {
                                req.logout();
                                res.json({ success: false });
                            }
                        })
                    } else {
                        req.logout();
                        res.json({ success: false });
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

        app.post('/users/add', isLoggedIn, function (req, res) {
            var profile = {};
            profile.username = req.body.username;
            profile.password = req.body.password;
            profile.email = req.body.email;
            profile.firstName = req.body.firstName;
            profile.lastName = req.body.lastName;
            profile.picurl = req.body.picurl;
            profile.admin = req.body.admin;
            db.addUser(profile);
            res.redirect('/users');
        });

        app.put('/users/edit/:username', isLoggedIn, function (req, res) {
            var profile = {};

            db.findUser(req.params.username, (err, user) => {
                if (err) {
                    console.log(err)
                    res.json({ success: false });
                }

                if (req.body.username)
                    profile.username = req.body.username;
                else
                    profile.username = user.username;

                if (req.body.password)
                    profile.password = req.body.password;
                else
                    profile.password = user.password;

                if (req.body.firstName)
                    profile.firstName = req.body.firstName;
                else
                    profile.firstName = user.firstName;

                if (req.body.lastName)
                    profile.lastName = req.body.lastName;
                else
                    profile.lastName = user.lastName;

                if (req.body.email)
                    profile.email = req.body.email;
                else
                    profile.email = user.email;

                if (req.body.picurl)
                    profile.picurl = req.body.picurl;
                else
                    profile.picurl = user.picurl;

                db.updateUsername(req.params.username, profile);
                res.redirect('/users');
            });
        });

        app.delete('/users/del/:username', isLoggedIn, function (req, res) {
            db.deleteUsername(req.params.username);
            res.redirect('/users');
        });

        app.get('/users/list', isLoggedIn, (req, res) => {
            db.getAllUsers((err, users) => {
                if (err) {
                    console.log(err)
                    res.json({ success: false });
                }

                res.json({ users, success: true });
            })
        });

        app.get('/users/:username', isLoggedIn, function (req, res) {
            var profile = {};

            db.findUser(req.params.username, (err, user) => {
                if (err) {
                    console.log(err)
                    res.json({ success: false });
                }

                profile.username = user.username;
                profile.password = user.password;
                profile.email = user.email;
                profile.firstName = user.firstName;
                profile.lastName = user.lastName;
                profile.picurl = user.picurl;
                profile.admin = user.admin;

                res.json({ user, success: true });
            });
        });

        app.get('/files/list/:username', isLoggedIn, (req, res) => {
            fs.exists("uploads/" + req.params.username, (exists) => {
                if (!exists)
                    fs.mkdir("uploads/" + req.params.username + "/", (err) => {
                        if (err) {
                            console.log(err)
                            res.json({ success: false });
                        }
                    });
                else {
                    fs.readdir("uploads/" + req.params.username, (err, files) => {
                        if (err) {
                            console.log(err)
                            res.json({ success: false });
                        }

                        res.json({ files: files, success: true });
                    });
                }
            });
        });

        app.get("/files/:username", isLoggedIn, (req, res) => {
            fs.exists("uploads/" + req.params.username, (exists) => {
                if (!exists)
                    fs.mkdir("uploads/" + req.params.username + "/", (err) => {
                        if (err) {
                            console.log(err)
                            res.json({ success: false });
                        }
                    });
                else {
                    fs.exists("uploads/" + req.params.username + ".zip", (exists) => {
                        if (exists)
                            fs.mkdir("uploads/" + req.params.username + "/", (err) => {
                                fs.unlinkSync("uploads/" + req.params.username + '.zip');
                            });
                        zip.zipFolder("uploads/" + req.params.username + "/", "uploads/" + req.params.username + ".zip", () => {
                            res.download("uploads/" + req.params.username + '.zip');
                        });
                    });
                }
            });
        });

        app.get("/files/:username/:filename", isLoggedIn, (req, res) => {
            fs.exists("uploads/" + req.params.username, (exists) => {
                if (!exists)
                    fs.mkdir("uploads/" + req.params.username + "/", (err) => {
                        if (err) {
                            console.log(err)
                            res.json({ success: false });
                        }
                    });
                else {
                    res.download("uploads/" + req.params.username + '/' + req.params.filename);
                }
            });
        });

        app.delete("/files/:username/:filename", isLoggedIn, (req, res) => {
            fs.exists("uploads/" + req.params.username, (exists) => {
                if (!exists) {
                    fs.mkdir("uploads/" + req.params.username + "/", (err) => {
                        if (err) {
                            console.log(err)
                            res.json({ success: false });
                        }
                    });
                    res.json({ success: true });
                }
                else {
                    fs.unlink("uploads/" + req.params.username + "/" + req.params.filename, (err) => {
                        if (err) {
                            console.log(err);
                            res.json({ success: false })
                        }
                        res.json({ success: true });
                    });
                }
            });
            res.json({ success: false })
        });

        // Upload para a pasta do utilizador especificado
        app.post("/files/upload/:username", isLoggedIn, (req, res) => {
            var form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                var count = 0;
                files.files.forEach(file => {
                    fs.exists("uploads/" + req.params.username + "/" + path.relative(path.dirname(file.originalFilename), __dirname), (exists) => {
                        if (!exists)
                            fs.mkdir("uploads/" + req.params.username + "/" + path.dirname(file.originalFilename), { recursive: true }, (err) => {
                                if (err) {
                                    console.log(err)
                                    res.json({ success: false });
                                }
                            })

                        fs.copyFile(file.path, `uploads/${req.params.username}/${file.originalFilename}`, (err) => {
                            if (err) {
                                console.log(err)
                                res.json({ success: false });
                            }

                            if (count === (files.files.length - 1))
                                res.json({ success: true });
                            fs.unlink(file.path, () => { });
                            count++;
                        });
                    });
                });
            });
        });
    }
}