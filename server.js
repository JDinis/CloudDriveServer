const app = require('./Scripts/expressDados').app,
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

app.post('/login',
    passport.authenticate('local-login',{
        successRedirect: '/profileRedir',
        failureRedirect: '/login'
}));


app.post('/signup',
    passport.authenticate('local-signup',{
        successRedirect: '/profileRedir',
        failureRedirect: '/login'
}));


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
        files.Files.forEach(file=>{
            fs.exists("../uploads/"+req.user.username+"/",(exists)=>{if(!exists)fs.mkdir("../uploads/"+req.user.username+"/",()=>{})});
            fs.copyFile(file.path,`../uploads/${req.user.username}/${file.originalFilename}`,()=>{});
            fs.unlink(file.path,()=>{});
        });
    });
    res.redirect("/file");
});