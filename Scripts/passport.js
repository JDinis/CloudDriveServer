const db                = require('./db');
const User              = db.User;
const passport          = require('Passport');
const LocalStrategy     = require('Passport-local').Strategy;

// Expoem esta função para a nossa app atraves do module.exports
module.exports = function(passport) {
    // ==========================================================================
    // ==========================================================================
    // ===================== Setup da sessão do passport ========================
    // ==========================================================================
    // =========== Necessario para sessões de login persistentes ================
    // = O passport necessita da capacidade de (de)serialização de utilizadores =
    // ==========================================================================
    // ==========================================================================
	
    // Utilizado para serializar a sessão do utilizador
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Utilizado para deserializar a sessão do utilizador
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // ======================== LOGIN LOCAL ====================================
    // =========================================================================
    // Usamos named strategies pois temos uma named stratagy para login e uma 
    // para registro, por defeito, se não existir nome será apenas chamada 'local'
    passport.use('local-login', new LocalStrategy({
        // Por defeito, o local strategy utiliza o username e password, por isso, fazemos o override com o username
        usernameField : 'username',
        passwordField : 'password',
		// Permite-nos passar de volta o pedido inteiro para o callback
        passReqToCallback : true
    },
	// Callback com username e password do nosso form
    function(req, username, password, done) { 

        // Encontra um utilizador com o mesmo username que foi preenchido no form
        // pretendemos verificar se o utilizador ja tem login feito.
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err){
                user.errors =JSON.stringify({
					err:'Invalid user data.',
					msg:err
                });
            }

            // Se não for encontrado o utilizador, devolve a mensagem
            if (!user){
                user.errors = JSON.stringify({
					err:'Invalid user data.',
					msg:'User not found'
                });
            }

            // Se o utilizador for encontrado mas a password esta incorrecta
            if (!user.validPassword(password)){
                user.errors = JSON.stringify({
					err:'Invalid user data.',
					msg:'Incorrect password'
                });
            }

            // Tudo se encontra bem, entao, devolvemos o utilizador
            return done(null, user);
        });
    }));
    
    // =========================================================================
    // ======================== REGISTRO LOCAL =================================
    // =========================================================================
    // Usamos named strategies pois temos uma named stratagy para login e uma 
    // para registro, por defeito, se não existir nome será apenas chamada 'local'

    passport.use('local-signup', new LocalStrategy({
        // Por defeito, o local strategy utiliza o username e password, por isso, fazemos o override com o username
        usernameField : 'username',
        passwordField : 'password',
		// Permite passar de volta o pedido inteiro para o callback
        passReqToCallback : true
    },
    function(req, username, password, done) {
        // Assincrono
        // User.findOne não corre a não ser que dados sejam enviados de volta
        process.nextTick(function() {
        // Encontra um utilizador cujo username seja o mesmo do que preenchido nos forms
        User.findOne({ 'username' :  username }, function(err, user) {
                // Se ocorrerem erros, devolver os erros
                if (err)
                    return done(err);

                // Verifica se ja existe um utilizador com o username pretendido
                if (user) {
                    return done(null, user);
					
				// Se não existir, cria-o
                } else {                   
                    var newUser	= new User();

                    // Inicia as credenciais locais do utlizador
                    newUser.username = username;
                    newUser.password = newUser.generateHash(password);
                    newUser.email = req.body.email;

                    // Guarda o utilizador
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
};