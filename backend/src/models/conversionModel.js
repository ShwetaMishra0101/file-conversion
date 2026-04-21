const mongoose = require('mongoose');
const conversionSchema = new mongoose.Schema({
    originalName: {type:String, require:true},
    originalFormat: {type:String, require:true},
    convertedFormat: {type:String, require:true},
    originalSize: {type:Number},
    convertedSize: {type:Number}
},
{timestamps:true}

);

module.exports = mongoose.model('Conversion', conversionSchema);