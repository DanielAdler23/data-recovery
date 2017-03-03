var express = require('express');
var router = express.Router();
var utils = require('./controllers/controllers')

router.get('/', function(req, res) {
    console.log('Service Started...')
    req.next()
})

router.post('/loadNewFiles', function(req, res) {
    utils.insertNewFiles((err, savedFiles) => {
        if(err)
            res.status(404).send({status: 404,  error: err })

        res.status(200).send({status: 200, message: savedFiles })
    })
})


router.post('/loadNewWords', function(req, res) {
    utils.insertNewWords((err, info )=> {
        if (err)
            res.status(404).send({status: 404, error: err})

        res.status(200).send({status: 200, message: info})
    })
})


router.get('/getAllFilesAdmin',function(req,res) {
    console.log('Get All Files')
    utils.getAllFilesAdmin((err, docs) => {
        if(err)
            res.status(404).send({message: 'Failed To Get Files', error: err})

        res.status(200).send({message: docs, error: null})
    })
})


router.get('/getAllFiles',function(req,res) {
    console.log('Get All Files')
    utils.getAllFiles((err, docs) => {
        if(err)
            res.status(404).send({message: 'Failed To Get Files', error: err})

        res.status(200).send({message: docs, error: null})
    })
})


router.get('/searchFiles/:searchValue', function(req, res) {
    console.log('Search Files')
    var searchValue = req.params.searchValue
    if(!searchValue || searchValue == " ")
        res.status(404).send({message: 'No search expression given'})
    utils.searchFiles(searchValue, (err, docs) => {
        if(err)
            res.status(404).send({message: 'Failed To Get Files', error: err})

        res.status(200).send({message: docs, error: null})
    })
})


router.get('/searchWords/:expression', function(req, res) {
    console.log('Search Words')
    var searchExpression = req.params.expression
    utils.searchWords(searchExpression, (err, docs) => {
        if(err)
            res.status(404).send({message: 'Failed To Get Words', error: err})

        res.status(200).send({message: docs, error: null})
    })
})


router.get('/getFile/:fileId', function(req, res) {
    console.log('File Body')
    var fileId = req.params.fileId
    utils.getFile(fileId, (err, docs) => {
        if(err)
            res.status(404).send({message: 'Failed To Get File', error: err})

        res.status(200).send({message: docs, error: null})
    })
})


router.post('/getFileObject', function(req, res) {
    console.log('Get File Object')
    var fileId = req.body.fileId
    var words = req.body.words
    var parsedWords = words.split(',')

    utils.getRelevantFiles(fileId, parsedWords, (err, docs) => {
        if(err)
            res.status(404).send({message: 'Failed To Get Files', error: err})

        res.status(200).send({message: docs, error: null})
    })
})


router.get('/toggleFile/:fileId', function(req, res) {
    console.log('Toggle File')
    var fileId = req.params.fileId
    utils.toggleFile(fileId, (err, docs) => {
        if(err)
            res.status(404).send({message: 'Failed To Get Files', error: err})

        res.status(200).send({message: docs, error: null})
    })
})

router.get('/getWord/:word', function(req, res) {
    var word = req.params.word
    utils.getWord(word, (err, doc) => {
        if(err) {
            console.log(err)
            res.status(404).send({message: 'Failed To Get Word', error: err })
        } else if(!doc) {
            res.status(200).send({message: "Couldn't find - " + word + " - in the database"})
        } else {
            console.log(doc)
            res.status(200).send({message: doc, error: null})
        }
    })

})






module.exports = router