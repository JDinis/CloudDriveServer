const app = require('./Scripts/expressDados').app,
multiparty = require('multiparty'),
config = require('./Scripts/config'),
passport  = require('./Scripts/expressDados').passport,
db = require('./Scripts/db'),
fs = require('fs'),
path = require('path');
var session;

function isLoggedIn(req, res, next) {                                       // Função que permite garantir que 
                                                                            // o utilizador esta autenticado.
    var logOut = 
    (req, res) => {  
        if(req.session!==undefined){
        req.session.destroy(function(err) {
            if(err) {
                console.log(err);
                res.json(JSON.stringify({success:false}));
            } else {
                req.logout();
                res.json(JSON.stringify({success:false}));
            }
      })}else{
            req.logout();
            res.json(JSON.stringify({success:false}));
      }};

        if(session!==undefined){
            if(session._id!==undefined){
                passport.deserializeUser(session._id,(err,user)=>{
                    if(err){
                        logOut(req,res);
                    }
            
                    req.user = user;

                    if (req.isAuthenticated())                                              // Se estiver autenticado corre a
                        return next();                                                      // proxima função
                });
            }else{
                logOut(req,res);
            }
        }else{
            logOut(req,res);
        }
};

app.post('/logout', function(req, res) {  
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
            req.logout();
            res.redirect('/Logout');
        }
  });
});

app.post('/login', passport.authenticate('local-login'),function(req,res){
    req.logIn(req.user,function(err){
        if(err!==undefined){
            if(err!==null){
                console.log(err);
            }
        }

        if(req.session.passport.user!==undefined){
            if(session===undefined)
                session=req.session;
            session._id=req.session.passport.user;
            session.save();
        }
        res.json(JSON.stringify({User:req.user,Error:req.user.errors}));
    });
});


app.post('/Signup',
    passport.authenticate('local-signup'),function(req,res){
        req.logIn(req.user,function(err){
            if(err!==undefined){
                if(err!==null){
                    console.log(err);
                }
            }
    
            if(req.session.passport.user!==undefined){
                if(session===undefined)
                    session=req.session;
                session._id=req.session.passport.user;
                session.save();
            }
            res.json(JSON.stringify({User:req.user}));
        });
    });


    app.post('/users/adduser',isLoggedIn,function(req,res){
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

app.put('/users/edituser/:userid',isLoggedIn,function(req,res){
    var profile = {};
    profile.username = req.body.username;
    profile.password = req.body.password;
    profile.email = req.body.email;
    profile.firstName = req.body.firstName;
    profile.lastName = req.body.lastName;
    profile.picurl = req.body.picurl;
    profile.admin = req.body.admin;
    db.updateUser(req.userid,profile);
    res.redirect('/users');
});

app.get('/users/list',(req,res)=>{
    db.getAllUsers((err,users)=>{
        if (err)
        console.log('err', err)

        res.json(JSON.stringify(users));
    })
});

app.get('/users/:username',isLoggedIn,function(req,res){
    var profile = {};
    profile.username = req.body.username;
    profile.password = req.body.password;
    profile.email = req.body.email;
    profile.firstName = req.body.firstName;
    profile.lastName = req.body.lastName;
    profile.picurl = req.body.picurl;
    profile.admin = req.body.admin;
    
    db.findUser(profile.username,(err,user)=>{
        if(err)
            console.log(err)
    
        res.json(JSON.stringify(user));
    });

    
});

app.get('/backend/profile',isLoggedIn,(req,res)=>{
    res.json(req.user);
});

app.get('/backend/profile/:username',isLoggedIn,(req,res)=>{
    db.findUser(req.username,(err,user)=>{
        res.json(req.user);
    })
});

app.get('/backend/file/list',isLoggedIn,(req,res)=>{
    fs.exists("uploads/"+req.user.username,(exists)=>{
        if(!exists)
            fs.mkdir("uploads/"+req.user.username+"/",(err)=>{ 
                if(err){
                    console.log(err);
                }
        });
        else {
            fs.readdir("uploads/"+req.user.username,(err,files)=>{
                if(err)
                    console.log(err);
                
                
                res.json(JSON.stringify({files:files,success:true}));
            });
        }
    });
});

app.get('/backend/file/list/:username',isLoggedIn,(req,res)=>{
    fs.exists("uploads/"+req.username,(exists)=>{
        if(!exists)
            fs.mkdir("uploads/"+req.username+"/",(err)=>{ 
                if(err){
                    console.log(err);
                }
        });
        else {
            fs.readdir("uploads/"+req.username,(err,files)=>{
                if(err)
                    console.log(err);
                
                
                res.json(JSON.stringify({files:files,success:true}));
            });
        }
    });
});

app.post("/backend/file/upload",isLoggedIn,(req,res)=>{
    var form = new multiparty.Form();
    form.parse(req,(err,fields,files)=>{
        var count = 0;
        files.files.forEach(file=>{
            fs.exists("uploads/"+req.user.username+"/"+path.relative(path.dirname(file.originalFilename),__dirname),(exists)=>{
                if(!exists)
                    fs.mkdir("uploads/"+req.user.username+"/"+path.dirname(file.originalFilename),{recursive:true},(err)=>{ 
                        if(err){
                            console.log(err);
                        }
                })
                        
                fs.copyFile(file.path,`uploads/${req.user.username}/${file.originalFilename}`,(err)=>{
                    if(err){
                        console.log(err);
                    }
                    
                    if(count===files.length-1)
                        res.json(JSON.stringify({success:true}))
                    fs.unlink(file.path,()=>{});
                    count++;
                });
            });
        });
    });
});

app.post("/backend/file/upload/:username",isLoggedIn,(req,res)=>{
    var form = new multiparty.Form();
    form.parse(req,(err,fields,files)=>{
        var count = 0;
        files.files.forEach(file=>{
            fs.exists("uploads/"+req.username+"/"+path.relative(path.dirname(file.originalFilename),__dirname),(exists)=>{
                if(!exists)
                    fs.mkdir("uploads/"+req.username+"/"+path.dirname(file.originalFilename),{recursive:true},(err)=>{ 
                        if(err){
                            console.log(err);
                        }
                })
                        
                fs.copyFile(file.path,`uploads/${req.user.username}/${file.originalFilename}`,(err)=>{
                    if(err){
                        console.log(err);
                    }
                    
                    if(count===files.length-1)
                        res.json(JSON.stringify({success:true}))
                    fs.unlink(file.path,()=>{});
                    count++;
                });
            });
        });
    });
});

app.get("/backend/file/:filename",isLoggedIn,(req,res)=>{
    fs.exists("uploads/"+req.user.username,(exists)=>{
        if(!exists)
            fs.mkdir("uploads/"+req.user.username+"/",(err)=>{ 
                if(err){
                    console.log(err);
                }
                res.json(JSON.stringify({success:false}))
        });
        else {
            res.sendFile("uploads/"+req.user.username+'/'+req.filename);
        }
    });
});

app.get("/backend/file/:username/:filename",isLoggedIn,(req,res)=>{
    fs.exists("uploads/"+req.username,(exists)=>{
        if(!exists)
            fs.mkdir("uploads/"+req.username+"/",(err)=>{ 
                if(err){
                    console.log(err);
                }
                res.json(JSON.stringify({success:false}))
        });
        else {
            res.sendFile("uploads/"+req.username+'/'+req.filename);
        }
    });
});

app.delete("/backend/file/:username/:filename",isLoggedIn,(req,res)=>{
    fs.exists("uploads/"+req.username,(exists)=>{
        if(!exists)
            fs.mkdir("uploads/"+req.username+"/",(err)=>{ 
                if(err){
                    console.log(err);
                }
                res.json(JSON.stringify({success:false}))
        });
        else {
            res.sendFile("uploads/"+req.username+'/'+req.filename);
        }
    });
});

app.delete("/backend/file/:filename",isLoggedIn,(req,res)=>{
    fs.exists("uploads/"+req.user.username,(exists)=>{
        if(!exists)
            fs.mkdir("uploads/"+req.user.username+"/",(err)=>{ 
                if(err){
                    console.log(err);
                }
                res.json(JSON.stringify({success:false}))
        });
        else {
            fs.unlink("uploads/"+req.user.username+'/'+req.filename,()=>{});
        }
    });
});

app.get('*',function(req,res){
    session = req.session;
    res.sendFile(path.resolve('clouddrive/build/index.html'))
});