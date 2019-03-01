const app = require('./Scripts/expressDados').app,
multiparty = require('multiparty'),
config = require('./Scripts/config'),
passport  = require('./Scripts/expressDados').passport,
db = require('./Scripts/db'),
fs = require('fs'),
path = require('path'),
cookieParser  = require('cookie-parser'),
location = require('location-href')
var session;
location()
                                                                            
function isLoggedIn(req, res, next) {                                       // Função que permite garantir que 
                                                                            // o utilizador esta autenticado.
    
        if(session!==undefined){
            if(session._id!==undefined){
                passport.deserializeUser(session._id,(err,user)=>{
                    if(err){
                        location.set('/logout');
                        res.end();
                    }
            
                    req.user = user;

                    if (req.isAuthenticated())                                              // Se estiver autenticado corre a
                        return next();                                                      // proxima função
                });
            }else{
                res.end('<script>var hi = function changeUrl(){window.location["href"]="http://localhost:3001/logout"}</script>javascript:hi();');
            }
        }else{
            location.set('/logout');
            res.end();
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


app.post('/signup',
    passport.authenticate('local-signup'));


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

app.post("/backend/file/upload",isLoggedIn,(req,res)=>{
    var form = new multiparty.Form();
    form.parse(req,(err,fields,files)=>{
        files.files.forEach(file=>{
            fs.exists("uploads/",(exists)=>{
                if(!exists)
                fs.mkdir("uploads/",(err)=>{ });
            });

            fs.exists("uploads/"+req.user.username+"/",(exists)=>{
                if(!exists)
                    fs.mkdir("uploads/"+req.user.username+"/",(err)=>{ 
                        if(err){
                            console.log(err);
                        }
                })
                        
                fs.copyFile(file.path,`uploads/${req.user.username}/${file.originalFilename}`,(err)=>{
                    if(err){
                        console.log(err);
                    }
                    
                    fs.unlink(file.path,()=>{});
                });
            });
        });
    });
});

app.get('*',function(req,res){
    session = req.session;
    res.sendFile(path.resolve('clouddrive/build/index.html'))
});