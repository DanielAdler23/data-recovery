var fs = require('fs')
var mv = require('mv')
var mongoose = require('mongoose');
var File = require('./schemas/fileSchema')
var Word = require('./schemas/wordSchema')
var sourceDir = './newFiles'
var destinationDir = './filesStorage'


module.exports = {
    insertNewFiles,
    insertNewWords,
    // searchWord: searchWord,
    // updateWordDB: updateWordDB,
    getFiles,
    // addNewFile: addNewFile
   }

stopList = [ "a", "the", "it", "is", "in",  "are", "and", "of", "this", "or", "was", "i", "to", "not", "by", "at", "as", "he", "an", "if", "ill", "im", "do"]
var finalMap = new Map()

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
                parsed: false
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
    File.find({ parsed: false }, function(err, files) {
        if (err) callback(err)


        for(var file of files) {
            parseBody(file._id, file.body)
            inProcess.push(file._id)
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



        // var newWords = files.map(file => parseBody(file._id, file.body))
        // Promise.all(newWords)
        //     .then(_ => {
        //         var newWordsMap = finalMap.map((value, key) => {return updateWordDB(value, key)})
        //         Promise.all(newWordsMap)
        //             .then(_ => {callback(null, 'All New Words Saved To Database')})
        //             .catch(err => {return callback(err, null)})
        //
        //     })
        //     .catch(err => callback(err, null))
    })
}


const parseBody = (fileId, fileBody) => {

    var wordsMap = new Map();

    fileBody = fileBody.replace(/'/g, "")
    fileBody = fileBody.replace(/[,"_!-?:.\r\n ]+/g, " ").trim().toLowerCase();

    var fileWords = fileBody.split(' ')

    for(var i in fileWords) {
        var word = fileWords[i]
        if(stopList.indexOf(word) > -1) continue;
        if (wordsMap.has(word)) {

            var updateWord = wordsMap.get(word);
            updateWord.hits++;
            updateWord.places.push({ offset: parseInt(i) + 1 });
            wordsMap.set(word, updateWord);
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
            );
        }
    }
    updateMap(wordsMap)
}


function updateMap(tmpMap) {
    tmpMap.forEach(function(value, key) {

        if(finalMap.has(key)) {

            var updateWord = finalMap.get(key);
            updateWord.hits++;
            updateWord.files.push(value)
            finalMap.set(key, updateWord);

        } else
            finalMap.set(key, { "files" : [ value ] });

    }, tmpMap)
}


const updateWordDB = (value, key) => new Promise((resolve, reject) => {
    console.log('updateWordDB function')

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
            return resolve('Hi')
        })

})


// function addNewFile(filePath, callback) {
//
//     var data = fs.readFileSync(filePath, 'utf8')
//
//     var newFile = new File({
//         title: filePath.split('/')[1].split('.')[0],
//         body: data
//     })
//
//     newFile.save(function(err, doc) {
//         if (err) callback(err);
//
//         console.log('file saved in database');
//         updateNewWords(doc)
//     });
// }

function updateNewWords(file) {
    var parsedNewFile = parseBody(file._id, file.body)

    parsedNewFile.forEach(function(value, key) {

        Word.findOneAndUpdate({word: key}, {$push:{files: value}}, {upsert:true}, function(err, doc){
            if(err){
                console.log("Something wrong when updating data!");
            }

            console.log(doc);
        });
    }, parsedNewFile)
}





// function searchWord(search, callback) {
//
//     getFiles((err, files) => {
//
//         if(err) return callback(err, null)
//
//         if(search.includes('&') && search.includes('|')) {
//
//             console.log('** OR + AND QUERY **')
//
//             andOrOperator(files, search, (err, result) => {
//                 if(err) return callback(err, null)
//
//                 var finalWords = []
//                 var wordsSplit = search.split('&')
//                 for(var split of wordsSplit) {
//                     if (split.includes('|'))
//                         finalWords = finalWords.concat(split.split('|'))
//                     else
//                         finalWords.push(split)
//                 }
//                 getWords(finalWords, (err, docs) => {
//                     if(err) return callback(err, null)
//                     return callback(null, {words: docs, files: result})
//                 })
//             })
//         } else if(search.includes('&')) {
//             console.log('** AND QUERY **')
//
//             var allAndWords = search.split('&')
//
//             getWords(allAndWords, (err, docs) => {
//                 andOperator(files, search, (result) => {
//                     return callback(null, {words: docs, files: result})
//                 })
//             })
//         } else if(search.includes('|')) {
//
//             console.log('** OR QUERY **')
//
//             var allOrWords = search.split('|')
//
//             getWords(allOrWords, (err, docs) => {
//                 orOperator(files, search, (result) => {
//                     return callback(null, {words: docs, files: result})
//                 })
//             })
//         } else {
//             var words = []
//             Word.findOne({'word': search}, {'_id': 0, '__v': 0}, (err, searchedWord) => {
//                 if(err)
//                     return callback(err, null)
//                 else {
//                     words.push(searchedWord)
//                     var result = relevantFiles(files, searchedWord)
//                 }
//                 return callback(null, {words: words, files: result})
//             })
//         }
//     })
// }
//
//
// function orOperator(files, search, callback) {
//     var words
//     var resultArray = []
//     words = search.split('|')
//
//     for(var orFile of files) {
//         var orBody = orFile.body
//         orBody = orBody.replace(/'/g, "")
//         orBody = orBody.replace(/[,"_!-?:.\r\n ]+/g, " ").trim().toLowerCase();
//
//         for(var orWord of words) {
//             if(orBody.includes(orWord))
//                 if(!resultArray.includes(orFile))
//                     resultArray.push(orFile)
//         }
//     }
//     callback(resultArray)
// }
//
// function andOperator(files, search, callback) {
//     var words
//     var resultArray = []
//
//     if(!search.includes('&')) {
//         for (var file of files) {
//             var bod = file.body
//             bod = bod.replace(/'/g, "")
//             bod = bod.replace(/[,"_!-?:.\r\n ]+/g, " ").trim().toLowerCase();
//             if (bod.includes(search))
//                 if (!resultArray.includes(file))
//                     resultArray.push(file)
//         }
//     } else {
//         words = search.split('&')
//
//         for(var andFile of files) {
//             var andBody = andFile.body
//             andBody = andBody.replace(/'/g, "")
//             andBody = andBody.replace(/[,"_!-?:.\r\n ]+/g, " ").trim().toLowerCase();
//
//             if(words.every( (word) => {return andBody.includes(word)}))
//                 if(!resultArray.includes(andFile))
//                     resultArray.push(andFile)
//         }
//     }
//
//     return callback(resultArray)
// }
//
// function andOrOperator(files, search, callback) {
//     search = search.split('|')
//
//     var complexResult = []
//
//     for(var section of search) {
//
//         andOperator(files, section, (result) => {
//             for(var res of result) {
//                 if(!complexResult.includes(res))
//                     complexResult.push(res)
//             }
//         })
//     }
//
//     return callback(null, complexResult)
// }
//
//
// function relevantFiles(allFiles, searchedWord) {
//     console.log(searchedWord)
//
//     var relevantFiles = []
//     for(var file of allFiles) {
//         for(var appears of searchedWord.files) {
//             if(file._id == appears.fileId)
//                     relevantFiles.push(file)
//         }
//     }
//     return relevantFiles
// }










function getWord(word, callback) {
    Word.findOne({word: word}, {'__v': 0}, (err, docs) => {
        if (err) return callback(err, null)
        else return callback(null, docs)
    })
}

function getWords(words, callback) {
    Word.find({word: { $in: words }}, {'__v':0}, function(err, docs){
        if(err) return callback(err, null)
        return callback(null, docs);
    });
}


function getFiles(callback){
    File.find({},{ '__v': 0}, (err, docs) => {
        if(err) return callback(err, null)

        return callback(null, docs)
    })
}
