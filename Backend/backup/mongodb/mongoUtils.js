var mongodb = require('./mongo.js');

module.exports = {
    insertFile: insertFile,
    deleteFile: deleteFile,
    getFile: getFile,
    insertWords: insertWords,
    deleteWord: deleteWord,
    getWord: getWord
}


function insertFile(files) {
    var filesCollection = mongodb.get().collection('files');

    for(var i in files) {
        filesCollection.insert(files[i], function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Inserted - ' + result.ops[0].title + ' - to files collection');
                insertWords(result.ops[0]._id, result.ops[0].body)
            }
        });
    }
}

function deleteFile() {

}

function getFile() {

}

function insertWords(fileId, text) {
    console.log('Parsing body for - ' + fileId)

    var parsedWords = parseText(fileId, text)

    console.log(parsedWords)



    // var wordsCollection = mongodb.get().collection('words');
    //
    // for(var i in parsedWords) {
    //     wordsCollection.insert(parsedWords[i], function (err, result) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log('yesyesyseyse')
    //
    //         }
    //     });
    // }
}

function deleteWord() {

}

function getWord() {

}



function parseText(fileId, text) {

    var result = []

    var index = [];
    var place = 0;

    text = text.replace(/[,'"!'?\n.\r ]+/g, " ").trim().toLowerCase();

    var array = text.split(" ");

    for(var word of array) {
        place++
        if (!(index.hasOwnProperty(word))) {
            index[word] = 1;
        } else {
            index[word]++;
        }

        var term = {
            string: word,
            hits: index[word],
            offset: place,
            fileId: fileId
        }


        result.push(term)

    }
    return result
}




