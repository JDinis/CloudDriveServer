const app = require('./Scripts/expressDados').app,
session = require('express-session'),
multiparty = require('multiparty'),
config = require('./Scripts/config'),
passport  = require('./Scripts/expressDados').passport,
db = require('./Scripts/db'),
fs = require('fs');
                                                                            
function isLoggedIn(req, res, next) {                                       // Função que permite garantir que 
                                                                            // o utilizador esta autenticado.

    if (req.isAuthenticated())                                              // Se estiver autenticado corre a
        return next();                                                      // proxima função

    res.redirect('/');                                                      // Senao redireciona para a pagina
}                                                                           // principal

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.post('/login', passport.authenticate('local-login'),function(req,res){
    res.json(JSON.stringify({User:req.user,Error:req.user.errors}));
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

app.get('/profile/:user',isLoggedIn, function(req, res) {
    db.findUser(req.params.user,function(err,user){
        if(err && req.user.admin){
            res.status(500).send('Error: '+err+' </br> Click <a href="javascript:history.back();">Here</a> to go back!');
        }else if(err!="User not found!" && err){
            res.status(500).send('Oops page not found! </br> Click <a href="javascript:history.back();">Here</a> to go back!');
        }else{
            if(req.user.admin)
                res.render('profile',{user:user,viewer:req.user});
            else if(!req.user.admin && req.user.username===req.params.user)
                res.render('profile',{user:req.user,viewer:req.user});
            else
                res.redirect('/profile/'+req.user.username);
        }
    });
});

app.get('/profileRedir',isLoggedIn, function(req, res) {
    if(req.user.admin)
        res.redirect('/backoffice');
    else
        res.redirect('/profile/'+req.user.username);
});

app.post("/backend/file/upload",isLoggedIn,(req,res)=>{
    var form = new multiparty.Form();
    form.parse(req,(err,fields,files)=>{
        files.Files.forEach(file=>{
            fs.exists("../uploads/"+req.user.username+"/",(exists)=>{if(!exists)fs.mkdir("../uploads/"+req.user.username+"/",()=>{})});
            fs.copyFile(file.path,`../uploads/${req.user.username}/${file.originalFilename}`,()=>{});
            fs.unlink(file.path,()=>{});
        });
    });
    res.redirect("/file");
});