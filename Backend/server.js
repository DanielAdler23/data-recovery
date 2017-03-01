
var express = require('express')
var app = express()
var port = process.env.PORT || 3000
var bodyParser = require('body-parser')


/*** Server Settings ***/
app.set('port', port)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.set("Content-Type", "application/json")
    next()
})

app.use('/', require('./routes'))

app.listen(port)
console.log("Service Is Listening On Port " + port)





