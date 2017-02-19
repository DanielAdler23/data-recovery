var fs = require('fs')


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



module.exports = {
    parseFiles: parseFiles
}