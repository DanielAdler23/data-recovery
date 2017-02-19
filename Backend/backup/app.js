const fs = require('fs');
var chokidar = require('chokidar');
var mongodb = require('mongodb');
var database = mongodb.MongoClient;
var url = 'mongodb://all:qwert12345@ds063546.mlab.com:63546/data_recovery'

var watcher = chokidar.watch('./sources', {
    ignored: /[\/\\]\./,
    persistent: true
});

database.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);

        //Parse files into an array
        var files = parseFiles('./sources')

        var collection = db.collection('files');

        for(var i in files) {
            collection.insert(files[i], function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Inserted document to - database: ' + collection.s.dbName + ', collection: ' + collection.s.name);
                }
            });
        }

        //Close connection
        db.close();
    };
});


function parseFiles(dir) {
    var filesList = [];

    var files = fs.readdirSync(dir)
    for(var i in files) {
        if(!files.hasOwnProperty(i) || files[i][0] == '.') continue;
        var path = dir + '/' + files[i];
        if(!fs.statSync(path).isDirectory()) {

            var data = fs.readFileSync(path, 'utf8')

            var file = {
                title: files[i].split('.')[0],
                body: data
            }

            filesList.push(file)
        }
    }
    return filesList
}


// function getFiles(dir){
//     fileList = [];
//
//     var files = fs.readdirSync(dir);
//     for(var i in files){
//         if (!files.hasOwnProperty(i) || files[i][0] == '.') continue;
//         var name = dir+'/'+files[i];
//         if (!fs.statSync(name).isDirectory()){
//
//             fs.readFile(name, 'UTF-8', (err, data) => {
//                 if(err)
//                     throw err;
//                 else {
//                     var filesCollection = database.get().collection('files');
//                     filesCollection.insertOne(data, function (err, docs) {
//                         if (err) {
//                             console.log(err)
//                         } else {
//                             console.log('file insert succeeded')
//                             console.log(docs)
//                         }
//                     })
//                 }
//
//
//             })
//
//
//
//
//
//
//
//
//             fileList.push(name);
//         }
//     }
//     return fileList;
// }











//
// watcher.on('add', path => {
//
//     console.log(`File ${path} has been added`)
//
//     fs.readFile( './' + path, 'UTF-8', (err, data) => {
//         if (err) throw err;
//
//         parseText(path, data)
//     });
// });
//
//
//
// var index = {};
//
// function parseText(file, text) {
//
//     var place = 0;
//
//     text = text.replace(/[,'"!'?\n. ]+/g, " ").trim().toLowerCase();
//
//     var array = text.split(" ");
//
//     for(var word of array) {
//         if (!(index.hasOwnProperty(word))) {
//             index[word] = 0;
//         }
//         index[word]++;
//     }
//
//     console.log(index);
// }
