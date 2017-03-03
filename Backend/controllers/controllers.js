var fs = require('fs')
var mv = require('mv')
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var File = require('./schemas/fileSchema')
var Word = require('./schemas/wordSchema')
var sourceDir = './newFiles'
var destinationDir = './filesStorage'
var jsep = require('jsep')


module.exports = {
    insertNewFiles,
    insertNewWords,
    // searchWord: searchWord,
    // updateWordDB: updateWordDB,
    getAllFiles,
    getAllFilesAdmin,
    getRelevantFiles,
    searchFiles,
    searchWords,
    getFile,
    getWord,
    getWords,
    toggleFile
   }

stopList = [ "a", "the", "it", "is", "in",  "are", "and",
            "of", "this", "or", "was", "i", "to", "not",
            "by", "at", "as", "he", "an", "if", "ill",
            "im", "do", "no", "for", "too", "go", "we",
            "on", "me", "him", "why", "what", "but", "will",
            "be", "you", "had", "his"]


function insertNewFiles(callback) {
    console.log('Insert New Files')
    var savedFiles = []
    var files = fs.readdirSync(sourceDir)
    if(files.length == 0)
        return callback(null, 'There Are No New Files')
    for(var i in files) {
        if(!files.hasOwnProperty(i) || files[i][0] == '.') continue;
        var path = sourceDir + '/' + files[i]
        if(!fs.statSync(path).isDirectory()) {

            var data = fs.readFileSync(path, 'utf8')

            var newFile = new File({
                title: files[i].split('.')[0],
                body: data,
                parsed: false,
                active: true
            })

            newFile.save((err, doc) => {
                if (err) return callback(err, null)
                console.log(`${doc.title} File Was Saved to Database`)

            })

            savedFiles.push(`${files[i].split('.')[0]} Was Saved To Database`)
            mv(`${sourceDir}/${files[i]}`, `./${destinationDir}/${files[i]}`, err => {
                if(err) console.error(err)
            })
        }
    }
    return callback(null, savedFiles)
}



function insertNewWords(callback) {
    console.log('Insert New Words')
    var inProcess = []
    var finalMap = new Map()
    File.find({ parsed: false }, function(err, files) {
        if (err) callback(err)


        for(var file of files) {
            inProcess.push(file._id)

            var tmpMap = parseBody(file._id, file.body)
            tmpMap.forEach((value, key) => {

                if(finalMap.has(key)) {

                    var updateWord = finalMap.get(key)
                    updateWord.hits++;
                    updateWord.files.push(value)
                    finalMap.set(key, updateWord)

                } else
                    finalMap.set(key, { "files" : [ value ] })

            }, tmpMap)
        }

        var finalMapArray = Array.from(finalMap)

        var newWords = finalMapArray.map(item => updateWordDB(item[1], item[0]))

        Promise.all(newWords)
            .then(_ => {
                for(var doc of inProcess) {
                    File.findOneAndUpdate({"_id": doc}, {"parsed": true}, err => {
                        if(err)
                            return callback(err, null)
                    })
                }
                return callback(null, 'Success')
            })
            .catch(err => callback('ERROR', null))
    })
}



const parseBody = (fileId, fileBody) => {

    var wordsMap = new Map()

    fileBody = fileBody.replace(/'/g, "")
    fileBody = fileBody.replace(/[,"_!-?:.\r\n ]+/g, " ").trim().toLowerCase()

    var fileWords = fileBody.split(' ')

    for(var i in fileWords) {
        var word = fileWords[i]
        if(stopList.indexOf(word) > -1) continue;
        if (wordsMap.has(word)) {

            var updateWord = wordsMap.get(word);
            updateWord.hits++;
            updateWord.places.push({ offset: parseInt(i) + 1 })
            wordsMap.set(word, updateWord)
        }
        else {
            wordsMap.set(word,
                {
                    "fileId" : fileId,
                    "hits" : parseInt(1),
                    places: [
                        { offset: parseInt(i) + 1 }
                    ]
                }
            )
        }
    }
    return wordsMap
}



const updateWordDB = (value, key) => new Promise((resolve, reject) => {

    Word.findOne({word: key}, {}, (err, doc) => {
        if (err) return reject(err)
        else if(!doc) {
            console.log(`Inserting new word to database - ${key}`)

            var filesArray = []

            for (var i in value.files) {
                filesArray.push(value.files[i])
            }

            var newWord = new Word({
                word: key,
                files: filesArray
            })

            newWord.save(function (err, doc) {
                if (err) return reject(err)

                console.log(doc.word + ' - Was Saved To Database');
                return resolve()
            })

        } else {
            console.log(`Updating existing word in database - ${key}`)

            Word.findOneAndUpdate({word: key}, {$push:{files: {$each: value.files}}}, function(err, doc){
                if(err){
                    console.error(err)
                    console.log(`Error while updating key - ${key}`);
                    return reject(err)
                }

                console.log(`${key} was successfully updated`);
                return resolve()

            })

        }
    })
})


function searchWords(expression, callback) {
    console.log(`searchWords - ${expression}`)
    var trimedExpression = expression.replace(/ +?/g, '')
    var parsedExpression = jsep(trimedExpression)

    var parsedWords = trimedExpression.replace(/[&&||()]/g, '+')
    parsedWords = parsedWords.split('+')
    parsedWords = parsedWords.filter(word => word != '')

    if(parsedExpression.type == 'LogicalExpression')
        logicalExpression(parsedExpression, (err, result) => {
            if(err)
                return callback(err, null)

            getFilesTitle(result, parsedWords, (err, titles) => {
                if(err) return callback(err, null)

                return callback(null, titles)
            })
        })

    if(parsedExpression.type == 'Identifier')
        getAllWordFiles([parsedExpression.name.toLowerCase()], (err, result) => {
            if(err)
                return callback(err, null)

            getFilesTitle(result[0], parsedWords, (err, titles) => {
                if(err) return callback(err, null)

                return callback(null, titles)
            })
        })
}


function logicalExpression(expression, callback) {
    console.log('logicalExpression')

    if(expression.left.type == 'LogicalExpression' && expression.right.type == 'LogicalExpression') {
        logicalExpression(expression.left, (err, result1) => {
            if(err)
                return callback(err, null)

            logicalExpression(expression.right, (err, result2) => {
                if(err)
                    return callback(err, null)

                chooseOperator(expression.operator, result1, result2, (err, finalResult) => {
                    if(err)
                        return callback(err, null)

                    return callback(null, finalResult)
                })
            })
        })
    }

    if(expression.left.type == 'LogicalExpression' && expression.right.type == 'Identifier') {
        logicalExpression(expression.left, (err, result) => {
            if(err)
                return callback(err, null)

            chooseOperator(expression.operator, result, expression.right.name.toLowerCase(), (err, result) => {
                if(err)
                    return callback(err, null)

                return callback(null, result)
            })
        })
    }

    if(expression.left.type == 'Identifier' && expression.right.type == 'LogicalExpression') {
        logicalExpression(expression.right, (err, result) => {
            if(err)
                return callback(err, null)

            chooseOperator(expression.operator, expression.left.name.toLowerCase(), result, (err, result) => {
                if(err)
                    return callback(err, null)

                return callback(null, result)
            })
        })
    }


    if(expression.left.type == 'Identifier' && expression.right.type == 'Identifier') {
        chooseOperator(expression.operator, expression.left.name.toLowerCase(), expression.right.name.toLowerCase(), (err, result) => {
            if(err)
                return callback(err, null)

            return callback(null, result)
        })
    }
}


function chooseOperator(operator, left, right, callback) {
    if (operator == '&&')
        andOperator(left, right, (err, result) => {
            if(err)
                return callback(err, null)

            return callback(null, result)
        })
    else if (operator == '||')
        orOperator(left, right, (err, result) => {
            if(err)
                return callback(err, null)

            return callback(null, result)
        })
}


function orOperator(word1, word2, callback) {
    let query = []
    let firstArray
    let secondArray
    Array.isArray(word1) ? firstArray = word1 : query.push(word1)
    Array.isArray(word2) ? secondArray = word2 : query.push(word2)

    if(query.length == 2) {
        getAllWordFiles(query, (err, result) => {
            if(err) return callback(err, null)

            if(result.length == 0)
                return callback(null, [])
            else if(result.length == 1)
                return callback(null, result[0])
            else {
                var array1 = result[0]
                var array2 = result[1]

                for(let item of array1)
                    if(!array2.includes(item))
                        array2.push(item)

                return callback(null, array2)
            }
        })
    }


    if(query.length == 1) {
        console.log('query length = 1')
        firstArray ? getAllWordFiles(query, (err, result) => {
            if(result.length == 0)
                return callback(null, [])
            for(let item of result[0])
                if(!firstArray.includes(item))
                    firstArray.push(item)

            return callback(null, firstArray)
        }) : getAllWordFiles(query, (err, result) => {
            if(result.length == 0)
                return callback(null, [])
            for(let item of result[0])
                if(!secondArray.includes(item))
                    secondArray.push(item)

            return callback(null, firstArray)
        })

    }


    if(query.length == 0) {
        for(let item of firstArray)
            if(!secondArray.includes(item))
                secondArray.push(item)

        return callback(null, secondArray)
    }
}


function andOperator(word1, word2, callback) {
    let query = []
    let firstArray
    let secondArray
    Array.isArray(word1) ? firstArray = word1 : query.push(word1)
    Array.isArray(word2) ? secondArray = word2 : query.push(word2)


    if(query.length == 2) {
        getAllWordFiles(query, (err, result) => {
            if(err) return callback(err, null)

            if(result.length == 0 || result.length == 1)
                return callback(null, [])

            let array1 = result[0]
            let array2 = result[1]

            let resultArray = array1.filter(val => array2.includes(val))

            return callback(null, resultArray)
        })
    }


    if(query.length == 1) {
        console.log('query length = 1')
        firstArray ? getAllWordFiles(query, (err, result) => {
            if(result.length == 0)
                return callback(null, [])
            let resultArray = firstArray.filter(val => result[0].includes(val))

            return callback(null, resultArray)
        }) : getAllWordFiles(query, (err, result) => {
            if(result.length == 0)
                return callback(null, [])
            let resultArray = secondArray.filter(val => result[0].includes(val))

            return callback(null, resultArray)
        })

    }


    if(query.length == 0) {

        let resultArray = firstArray.filter(val => secondArray.includes(val))

        return callback(null, resultArray)
    }
}


function getWord(word, callback) {
    Word.findOne({word: word}, {'__v': 0}, (err, docs) => {
        if (err) return callback(err, null)
        else return callback(null, docs)
    })
}

function getWords(words, callback) {
    Word.find({word: { $in: words }}, {'__v':0}, (err, docs) => {
        if(err) return callback(err, null)
        return callback(null, docs);
    });
}

function getAllWordFiles(word, callback) {
    Word.find({word: { $in: word }},  {'__v':0}, (err, docs) => {
        if(err) return callback(err, null)

        let fileIds = docs.map(doc => {
            return doc.files.map(file => {
                return file.fileId
            })
        })

        return callback(null, fileIds);
    })
}

function getFile(fileId, callback) {
    File.find({"_id" : ObjectId(fileId)}, (err, docs) => {
        if(err) return callback(err, null)

        return callback(null, docs)
    })
}


function getAllFiles(callback) {
    File.find({"active": true}, {  '__v': 0}, (err, docs) => {
        if(err) return callback(err, null)

        return callback(null, docs)
    })
}

function getAllFilesAdmin(callback) {
    File.find({},{ '__v': 0}, (err, docs) => {
        if(err) return callback(err, null)

        return callback(null, docs)
    })
}

function getFilesTitle(fileIds, parsedWords, callback) {
    var ids = fileIds.map(id => ObjectId(id))
    File.find({"_id" : { $in: ids }}, {'__v': 0, 'body': 0, 'parsed': 0, 'active': 0 }, (err, docs) => {
        if(err) return callback(err, null)

        for(var item of docs)
            item.words = parsedWords

        return callback(null, docs)
    }).lean()
}


function searchFiles(searchValue, callback) {
    var searchString = new RegExp(searchValue, "i");
    File.find({"title": searchString, "active": true }, (err, docs) => {
        if(err) return callback(err, null)

        return callback(null, docs)
    })
}

function toggleFile(fileId, callback) {
    File.find({"_id" : ObjectId(fileId)}, (err, docs) => {
        if(err) return callback(err, null)

        if(docs[0]._doc.active)
            File.findOneAndUpdate({"_id" : ObjectId(fileId)}, {active: false}, function(err, doc){
                if(err){
                    console.error(err)
                    console.log(`Error while updating file - ${fileId}`);
                    return callback(err, null)
                }
                console.log(`${fileId} Deactivated`);
                return callback(null, null)
            })
        else
            File.findOneAndUpdate({"_id" : ObjectId(fileId)}, {active: true}, function(err, doc){
                if(err){
                    console.error(err)
                    console.log(`Error while updating file - ${fileId}`);
                    return callback(err, null)
                }
                console.log(`${fileId} Activated`);
                return callback(null, null)
            })
    })
}


function getRelevantFiles(fileId, searchWords, callback) {
    getWords(searchWords, (err, docs) => {
        if(err) return callback(err, null)

        getFile(fileId, (err, entireFile) => {
            if(err) return callback(err, null)

            var offsets = []

            for(var doc of docs) {
                for(var file of doc.files) {
                    if(file.fileId == fileId)
                        for(var off of file.places)
                            offsets.push(off.offset)
                }
            }

            var finalResult = {
                fileBody: entireFile[0].body,
                offsets: offsets
            }
            return callback(null, finalResult)
        })
    })
}