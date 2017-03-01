//---------------------------------Connect Tp MongoDB On Mlab Via Mongoose--------------------------------------//
var mongoose = require('mongoose')
config = { mongoUrl: 'mongodb://all:qwert12345@ds063546.mlab.com:63546/data_recovery' };


//The Server Option Auto_Reconnect Is Defaulted To True
var options = {
    server: {
        auto_reconnect:true,
    }
};

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl, options);
db = mongoose.connection;//A Global Connection Variable

//Event Handlers For Mongoose
db.on('error', function(err){
    console.log('Mongoose: Error: ' + err);
});

db.on('open', function(){
    console.log('Mongoose: Connection Established');
});

db.on('disconnected', function(){
    console.log('Mongoose: Connection Stopped, Reconnecting...');
    mongoose.connect(config.mongoUrl, options);
});

db.on('reconnected', function(){
    console.log('Mongoose Reconnected!');
});