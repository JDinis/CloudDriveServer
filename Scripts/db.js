const mongoose  = require('mongoose');                                  // O modulo mongoose permite aceder a 
                                                                        // base de dados mongodb facilmente.
                                                                        
const config    = require('./config');                                  // Ficheiro onde guardamos informações 
                                                                        // que são bastante reutilizaveis.
                                                                        
const bcrypt    = require('bcrypt-nodejs');                             // Modulo que contem funçoes para 
                                                                        // gerar uma hash da password e 
                                                                        // verificar se hash e password são 
                                                                        // iguais.

mongoose.connect(config.url,{ useNewUrlParser: true });                                           // Liga-se a bd mongodb no url 
                                                                        // especificado no ficheiro config.js.

var dbObj  = mongoose.connection;                                       // Objecto que representa a ligação 
                                                                        // ao mongodb.

var Schema = mongoose.Schema;                                           // Representa um Schema que é um mapa
                                                                        // (ligação) para uma colecção do
                                                                        // mongodb e define a estrutura dos
                                                                        // documentos da colecção.

var UsersSchema = new Schema({                                          // Schema para representar os dados 
                                                                        // dos utilizadores que estão 
                                                                        // guardados no mongodb.
                                                                        
    username  : String,                                                 // Username dos utilizadores.
    password  : String,                                                 // Password dos utilizadores.
    email     : String,                                                 // Email dos utilizadores.
    firstName : String,                                                 // Primeiro nome dos utilizadores.
    lastName  : String,                                                 // Ultimo nome dos utilizadores.
    picurl    : String,                                                 // Imagem de prefil
    admin     : Boolean                                                 // Administrador
});

UsersSchema.methods.generateHash  = function(password) {                // Adiciona ao objecto UserSchema a 
                                                                        // função que gera hashes.
                                                                        
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);       // Devolve uma string com a hash da 
                                                                        // password do utilizador que ira ser 
                                                                        // guardada na bd quando se fizer o 
};                                                                      // registo.

UsersSchema.methods.validPassword = function(password) {                // Adiciona ao objecto UserSchema a
                                                                        // função que verifica se password e 
                                                                        // hash sao iguais.
                                                                        
    return bcrypt.compareSync(password, this.password);                 // Devolve o resultado da comparação
                                                                        // entre hash e password 
};                                                                      // (provavelmente true/false).

var getAllUsers = function getAllUsers(callback){                       // Objecto que representa a função 
    // getAllUsers para que possa ser
    // usada noutro ficheiro.
                                                                            
        // Muito importante: Um callback é uma função que será chamada mais tarde, para tal a função e passada
        // como parametro. O objectivo do callback é obter um resultado que não conseguimos normalmente aceder
        // devido ao resultado com queremos a trabalhar estar dentro de uma função assincrona, então usamos o
        // resultado como parametro da função callback que é chamada na zona onde queremos trabalhar e ai acedemos
        // aos dados. Apesar de parecer complicado e bastante facil de perceber assim que se observe um exemplo do
        // genero:
        // function queroTrabalharAqui(){
        //      func(function(resultado){    <- Estamos a chamar a função func que tem como parametro a função de 
        //                                      callback e o callback tem um parametro que serão os resultados
        //                                      que queremos que sejam obtidos e trabalhados.
        //
        //          console.log(resultado);  <- Mostra os valores pesquisados na base de dados dentro do find da
        //                                      função func.
        //      });
        //  }
        //
        // function func(callback){
        //      Model.find({'username':'alguem'}).cursor().on('data',function(alguem){
        //          callback(alguem); <- Como acima dissemos que function era a nossa função callback e resultado
        //                               sera o parametro dessa função, aqui indicamos que resultado = alguem e
        //                               vamos chamar a função callback.
        //      });
        // }
        //
        // Resumindo: queroTrabalharAqui chama func que chama uma função definida quando chamamos func que será o
        // nosso callback.
        
        var cursor = User.find({}).cursor();
        
        json = "{ \"users\": [";
        
        cursor.on('data', function(user){
            json+= JSON.stringify(user.toJSON());
            if(cursor.next(function(err,usr){
                if(usr){
                    json+=","+JSON.stringify(usr);
                }
            }));
        });
    
        cursor.on('close',function(){
            return callback(null,JSON.parse(json+"]}"));
        });
        
        cursor.on('error',function(err){
            return callback(err);
        });
    };

var addUser = function addUser(profile){
    User.findOne({"username":profile.username},function(err,user){
        if(user){
            console.log('User already exists!');
            return err;
        }
        
        var usr = new UserList();
        
        usr.username = profile.username;
        usr.password = usr.generateHash(profile.password);
        usr.email = profile.email;
        usr.firstName = profile.firstName;
        usr.lastName = profile.lastName;
        usr.picurl = profile.picurl;
        usr.admin = profile.admin;

        
        return usr.save(function(err,newusr){
           if(err){
               console.log('Error creating user '+newusr.id);
               return err;
           }
           
           console.log('User '+newusr.id+' created!');
        });
    });
}

var findUser = function findUser(username,callback){
    return User.findOne({"username":username},function(err,user){
       if(err){
           console.log('Error: '+err);
           return callback(err);
       }else if(!user){
           return callback('User not found!');
       }
        
        return callback(null,user);
    });
};

var updateUser = function updateUser(userid,profile){
    return User.findById(userid, function(err, user){
        if(!user)                                                       //
            console.log('Error: User not found!');                      //
        else if(err){
            console.log('Error: '+err);
            return err;
        }
        
        if(profile.username)
            user.username=profile.username;
        
        if(profile.password)
            user.password=user.generateHash(profile.password);
        
        if(profile.firstName)
            user.firstName=profile.firstName;
        
        if(profile.lastName)
            user.lastName=profile.lastName;
        
        if(profile.email)
            user.email=profile.email;
        
        if(profile.picurl)
            user.picurl=profile.picurl;
                                                                //
        
        return user.save(function(err) {
            if(!err)
                console.log('Username: '+user.username+' was updated!');
            else
                return console.log('Error: '+err);
        });
    });
};


var deleteUser = function deleteUser(userid){
    return User.findById(userid, function(err, user){
        if(!user)                                                           //
            return console.log('Error: User not found!');                   //
        
        return user.remove(function(err,usr){
            if(!err)
                console.log('Username: '+ usr.username +' - '+usr.id+' was deleted!');
            else
                return console.log('Error: '+err);
        });
    });
};

const User = mongoose.model('user',UsersSchema);                        // Inicializa a variavel UserList com
                                                                        // o model que representa os 
                                                                        // documentos da colecção users
                                                                        // guardados no mongodb.

dbObj.once('connected', function (err) {
    User.countDocuments(function(err,count){
        if(err){
            console.log(err);
        }
        
        if(count<=0){
            User.create(new User({firstName:"Joao",lastName:"Dinis",username:"JDinis",password:User.schema.methods.generateHash("admin"),email:"j.p.dinis89@gmail.com",admin:true}));
            User.create(new User({firstName:"Mario",lastName:"Simoes",username:"MSimoes",password:User.schema.methods.generateHash("admin"),email:"mariosimoes@gmail.com",admin:true}));
        }
    })
});
                                                                        
        
module.exports = {                                                      // Ao exportar os objectos estamos a
                                                                        // permitir que estes sejam usados 
                                                                        // dentro de outros ficheiros usando
                                                                        // require('./db');
                                                                        
  'User':User,                                                          // Exporta o objecto UserList.
  'dbObj':dbObj,                                                        // Exporta o objecto dbObj que 
                                                                        // representa a ligação ao mongodb.
                                                                        
  'UserSchema':UsersSchema,
  'getAllUsers': getAllUsers,                                           // Exporta a função getAllUserss
  'findUser'   : findUser,                                              // Exporta a função findUser
  'addUser'    : addUser,                                               // Exporta a função addUser
  'updateUser' : updateUser,                                            // Exporta a função updateUser
  'deleteUser' : deleteUser                                             // Exporta a função deleteUser
};