const express       = require('express');               // Express 4.0 framework para criar web apps.

const session       = require('express-session');       // Gere as sessoes para o express.

const cookieParser  = require('cookie-parser');         // Faz parse ao cabeçalho das cookies e gera
                                                        // um objecto req.cookies com valores das cookies.

const flash         = require('connect-flash');         // middleware que usa uma parte da sessao para
                                                        // guardar mensagens.
                                                        
const passport      = require('passport');              // middleware de autenticaçao para o node.

const config        = require('./config');              // Ficheiro onde guardamos informações que são
                                                        // bastante reutilizaveis.
                                                        
const bodyParser    = require('body-parser');           // middleware para fazer parse ao corpo do request.
                                                        
const db            = require('./db');                  // Ficheiro onde guardamos tudo que tem a ver
                                                        // com a base de dados mongodb
const app           = express();

const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

require('./passport')(passport);                        // Conjunto de funções que queremos adicionar ao
                                                        // passport.

app.use(cookieParser());                                // Inicializar cookieParser para obter as
                                                        // cookies com req.cookies.

app.use(bodyParser.urlencoded({ extended: false }));    // inicializar o bodyParser para obter os codificados
                                                        // dados de post vindos de um form atraves
                                                        // do objecto req.body.{variavel}.

app.use(bodyParser.json());                             // Indicamos que queremos o body sob forma de json

app.use(session({ 
    name:'user_sid',
    secret:config.clientSecret,                         // A usar o clientSecret do auth0 como segredo
                                                        // de sessao e inicializar o passport
                                                        // para autenticaçao dos utilizadores
                                                        // (login/signup/etc...)
    resave:true,
    saveUninitialized:true,
    User:null,
    cookie: {
        secure: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());                         // Inicializa o passport
app.use(passport.session());                            // Inicializa a sessao que o passport ira usar.

app.use(flash());                                       // A usar o modulo flash para mostrar mensagens,
                                                        // tais como dados incorrectos ao fazer login.

app.use(express.static("../"));
app.use(express.static("../static"));

app.use(allowCrossDomain);

app.listen(config.port);                                // Começa a escutar ligaçoes na porta
                                                        // especificada no ficheiro config

module.exports = {                                      // Ao exportar os objectos estamos a permitir que
                                                        // estes sejam usados dentro de outros ficheiros
                                                        // usando require('./expressDados');
                                                        
  'app': app,                                           // Exporta o objecto app que contem as funçoes 
                                                        // do express.
                                                        
  'passport':passport                                   // Exporta o objecto passport que contem as funçoes
}; 