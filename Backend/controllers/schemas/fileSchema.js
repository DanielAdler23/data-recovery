var mongoose = require('mongoose')
var schema = mongoose.Schema

var fileSchema = new schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    parsed: { type: Boolean, required: true },
    active: { type: Boolean, required: true }
}, {collection: 'files'})


var File = mongoose.model('File', fileSchema)
module.exports = File