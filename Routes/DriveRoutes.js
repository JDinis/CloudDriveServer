const multiparty = require('multiparty'),
    fs = require('fs'),
    path = require('path'),
    passport = require('../Scripts/expressDados').passport,
    zip = require('zip-a-folder');

function getFilesFromPath(path, filename) {
    let dir = fs.readdirSync(path);
    return dir.filter(elm => elm.match(new RegExp(filename, 'ig')))[0];
}

module.exports = {
    DriveRoutes: (app, session, db) => {
        function isLoggedIn(req, res, next) {
            // Função que permite garantir que 
            // o utilizador esta autenticado.

            var logOut =
                (req, res) => {
                    if (req.session !== undefined) {
                        req.session.destroy(function (err) {
                            if (err) {
                                console.log(err);
                                return res.json({ success: false });
                            } else {
                                req.logout();
                                return res.json({ success: false });
                            }
                        })
                    } else {
                        req.logout();
                        return res.json({ success: false });
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

        app.get('/files', isLoggedIn, (req, res) => {
            fs.exists("uploads/" + req.user.username, (exists) => {
                if (!exists)
                    fs.mkdir("uploads/" + req.user.username + "/", (err) => {
                        if (err) {
                            console.log(err)
                            return res.json({ success: false });
                        }
                        return res.json({ files: files, success: true });
                    });
                else {
                    fs.readdir("uploads/" + req.user.username, (err, files) => {
                        if (err) {
                            console.log(err)
                            return res.json({ success: false });
                        }

                        return res.json({ files: files, success: true });
                    });
                }
            });
        });

        app.post("/files/upload", isLoggedIn, (req, res) => {
            var form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                var count = 0;
                files.files.forEach(file => {
                    fs.exists("uploads/" + req.user.username + "/", (exists) => {
                        if (!exists)
                            fs.mkdir("uploads/" + req.user.username + "/", { recursive: true }, (err) => {
                                if (err) {
                                    console.log(err)
                                    return res.json({ success: false });
                                }
                            })

                        fs.copyFile(file.path, `uploads/${req.user.username}/${file.originalFilename}`, (err) => {
                            if (err) {
                                console.log(err)
                                return res.json({ success: false });
                            }

                            if (count === (files.files.length - 1)) {
                                fs.unlink(file.path, () => { });
                                return res.json({ success: true });
                            }
                            fs.unlink(file.path, () => { });
                            count++;
                        });
                    });
                });
            });
        });


        app.post("/files/uploadsmart", (req, res) => {
            if (req.user === undefined)
                return res.json({ success: false });

            var form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                var count = 0;
                files.files.forEach(file => {
                    fs.exists("uploads/" + req.user.username + "/", (exists) => {
                        if (!exists)
                            fs.mkdir("uploads/" + req.user.username + "/", { recursive: true }, (err) => {
                                if (err) {
                                    console.log(err)
                                    return res.json({ success: false });
                                }
                            })

                        fs.copyFile(file.path, `uploads/${req.user.username}/${file.originalFilename}`, (err) => {
                            if (err) {
                                console.log(err)
                                return res.json({ success: false });
                            }

                            if (count === (files.files.length - 1)) {
                                fs.unlink(file.path, () => { });
                                return res.json({ success: true });
                            }
                            fs.unlink(file.path, () => { });
                            count++;
                        });
                    });
                });
            });
        });

        app.get("/search/:filename", isLoggedIn, (req, res) => {
            fs.exists("uploads/" + req.user.username, (exists) => {
                if (!exists)
                    fs.mkdir("uploads/" + req.user.username + "/", (err) => {
                        if (err) {
                            console.log(err)
                            return res.json({ success: false });
                        }
                        return res.json({ success: false });
                    });
                else {
                    return res.download("uploads/" + req.user.username + '/' + getFilesFromPath("uploads/" + req.user.username + '/', req.params.filename));
                }
            });
        });

        app.delete("/files/:filename", isLoggedIn, (req, res) => {
            fs.exists("uploads/" + req.user.username, (exists) => {
                if (!exists)
                    fs.mkdir("uploads/" + req.user.username + "/", (err) => {
                        if (err) {
                            console.log(err)
                            return res.json({ success: false });
                        }
                    });
                else {
                    fs.unlink("uploads/" + req.user.username + '/' + getFilesFromPath("uploads/" + req.user.username + '/', req.params.filename), (err) => {
                        if (err)
                            return res.json({ success: false });
                        else
                            return res.json({ success: true });
                    });
                }
            });
        });
    }
}