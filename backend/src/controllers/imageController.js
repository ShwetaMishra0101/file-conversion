const sharp = require('sharp');
const { v4: uuidv4 } = require("uuid");
const path = require('path');
const fs = require('fs');
const Conversion = require('../models/conversionModel');

const convertImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        const { format } = req.body;
        const allowedFormats = ['tiff', "tif", "svg", "heic", "raw", 'png', 'jpeg', 'webp', 'gif', 'avif'];

        if (!allowedFormats.includes(format)) {
            return res.status(400).json({ message: 'Invalid format' });
        }

        const inputPath = req.file.path
        const outputFilename = `${uuidv4()}.${format}`;
        const outputPath = path.join('src/uploads', outputFilename)
        // Convert image using sharp
        await sharp(inputPath).toFormat(format).toFile(outputPath);
        const originalSize = req.file.size;
        const convertedSize = fs.statSync(outputPath).size;
        await Conversion.create({
            originalName: req.file.originalname,
            originalFormat: req.file.mimetype.split('/')[1],
            convertedFormat : format,
            originalSize,
            convertedSize
        });

        // Send converted file
        res.download(outputPath, outputFilename, (err)=>{
            // Cleanup temp files after download
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        })


    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error)
    }
}


const getHistory = async (req,res) =>{
    try{
        const history = await  Conversion.find().sort({ createdAt: -1 });
        res.status(200).json(history);

    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}

module.exports = {convertImage,getHistory}
