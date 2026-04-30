const mongoose = require('mongoose');
const conversionSchema = new mongoose.Schema({
    originalName: {type:String, require:true},
    // originalFormat: {type:String, require:true},
    convertedFormat: {type:String, require:true},
    // originalSize: {type:Number},
    // convertedSize: {type:Number},
    storedName:   { type: String, required: true },
    fileType:{ type: String, required: true },
    mimeType:     { type: String, required: true },
    size:         { type: Number, required: true },
    path:         { type: String, required: true },
    isConverted:  { type: Boolean, default: false },
    convertedTo:  { type: String, default: null },
},
{timestamps:true}

);

module.exports = mongoose.model('Conversion', conversionSchema);