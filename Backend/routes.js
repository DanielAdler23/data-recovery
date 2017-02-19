var express = require('express');
var router = express.Router();
var utils = require('./controllers/controllers')
// var chokidar = require('chokidar');

router.get('/', function(req, res) {
    console.log('Service Started...')
    req.next()
})

router.post('/loadNewFiles', function(req, res) {
    utils.insertNewFiles((err, savedFiles) => {
        if(err)
            res.status(404).send( { Error: err } )

        res.status(200).send( { Message: savedFiles } )
    })
})


router.post('/loadNewWords', function(req, res) {
    utils.insertNewWords((err, info )=> {
        if (err)
            res.status(404).send({Error: err})

        res.status(200).send({Message: info})
    })
})



//
// router.get('/getWord/:word', function(req, res) {
//     var word = req.params.word
//     utils.searchWord(word, (err, docs) => {
//         if(err) {
//             console.log(err)
//             res.status(404).send( { Error: err } )
//         } else if(!docs) {
//             res.status(200).send( { Message: "Couldn't find - " + word + " - in the database" } )
//         } else {
//             console.log(docs)
//             res.status(200).send( { result: docs } )
//         }
//     })
// })
//
// router.get('/getFiles',function(req,res){
//     var files = utils.getFiles()
//     files.exec(function (err,user) {
//         if(err){
//             console.log(err)
//             res.status(404).send( { Error: err } )
//         }else{
//             console.log(user)
//             res.status(200).send( { Result: user } )
//         }
//     })
// })

// var watcher = chokidar.watch('./sources', {
//     ignored: /[\/\\]\./,
//     persistent: true,
//     ignoreInitial: true,
// });
//
// watcher
//     .on('add', path => {
//         console.log(`File ${path} has been added`)
//         utils.addNewFile(path)
//     })





module.exports = router