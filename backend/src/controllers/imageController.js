const sharp = require('sharp');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');
const Media = require('../models/conversionModel');


// ─── GET all media (paginated + filtered) ────────────────────────────────────
const getMedia = async (req, res) => {
    try {
      const { page = 1, limit = 50, name, from, to } = req.query;
  
      const query = {};
      if (name) query.originalName = { $regex: name, $options: 'i' };
      if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to)   query.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59));
      }
  
      const total = await Media.countDocuments(query);
      const files = await Media.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      res.status(200).json({
        files,
        total,
        page:       parseInt(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


//   UPLOAD file ─

const uploadMedia = async (req,res) =>{
    try{
        if(!req.file) return res.status(400).json({message:"No file uploaded"});
        const ext = path.extname(req.file.originalname).replace('.','').toUpperCase();
        
        const media = await Media.create({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            fileType: ext,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
        })

        res.status(201).json(media);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}
  

const convertImage = async (req, res) => {

    try{

        const {id} = req.params;
        const { format } = req.body;
  
        // if (!req.file) {
        //     return res.status(400).json({ message: 'No image uploaded' });
        // }
        // const { format } = req.body;
        const allowedFormats = ['tiff', "tif", "svg", "heic", "raw", 'png', 'jpeg', 'webp', 'gif', 'avif'];

        if (!allowedFormats.includes(format)) {
            return res.status(400).json({ message: 'Invalid format' });
        }

        const original = await Media.findById(id);
        if(!original) return  res.status(404).json({message:"File not found"});

        const outputName = `${randomUUID()}.${format}`;

        const outputPath = path.join('src/uploads', outputName)
        await sharp(original.path).toFormat(format).toFile(outputPath);

        const convertedSize = fs.statSync(outputPath).size;
    
        const converted = await Media.create({
          originalName:  `${path.parse(original.originalName).name}.${format}`,
          storedName: outputName,
          fileType: format.toUpperCase(),
          mimeType: `image/${format}`,
          size: convertedSize,
          path: outputPath,
          isConverted: true,
          convertedFrom: original.fileType,
          convertedTo: format.toUpperCase(),
        });

        res.status(201).json(converted);

        // const inputPath = req.file.path
        // const outputFilename = `${uuidv4()}.${format}`;
        // const outputPath = path.join('src/uploads', outputFilename)
        // // Convert image using sharp
        // await sharp(inputPath).toFormat(format).toFile(outputPath);
        // const originalSize = req.file.size;
        // const convertedSize = fs.statSync(outputPath).size;
        // await Conversion.create({
        //     originalName: req.file.originalname,
        //     originalFormat: req.file.mimetype.split('/')[1],
        //     convertedFormat : format,
        //     originalSize,
        //     convertedSize
        // });

        // // Send converted file
        // res.download(outputPath, outputFilename, (err)=>{
        //     // Cleanup temp files after download
        //     fs.unlinkSync(inputPath);
        //     fs.unlinkSync(outputPath);
        // })


    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error)
    }
}

//  ─── DOWNLOAD file ───────────────────────────────────────────────────────────
const downloadMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'File not found' });

    res.download(media.path, media.originalName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE file ─────────────────────────────────────────────────────────────
const deleteMedia = async (req, res) => {
    try {
      const media = await Media.findById(req.params.id);
      if (!media) return res.status(404).json({ message: 'File not found' });
  
      if (fs.existsSync(media.path)) fs.unlinkSync(media.path);
      await Media.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

// const getHistory = async (req,res) =>{
//     try{
//         const history = await  Conversion.find().sort({ createdAt: -1 });
//         res.status(200).json(history);

//     }
//     catch(error){
//         res.status(500).json({ message: error.message });
//     }
// }




module.exports = {getMedia, uploadMedia, convertImage, downloadMedia, deleteMedia}
