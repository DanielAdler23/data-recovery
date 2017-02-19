var mongoose = require('mongoose')
var schema = mongoose.Schema

var wordSchema = new schema({
    word: { type: String, required: true, unique: true},
    files : [
        {
            _id: false,
            fileId: { type: String, required: true },
            hits: { type: Number, required: true },
            places: [
                {
                    _id: false,
                    offset: { type: String, required: true , _id: 0}
                }
            ]
        }
    ]
}, {collection: 'words'})


var Word = mongoose.model('Word', wordSchema)
module.exports = Word
