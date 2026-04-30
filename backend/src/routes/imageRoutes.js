const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { getMedia, uploadMedia, convertImage, downloadMedia, deleteMedia } = require('../controllers/imageController');

const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null, 'src/uploads/');
    },
    filename:(req,file,cb) =>{
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

const upload = multer ({
    storage,
    limits:{fileSize: 5 * 1024 * 1024},
    fileFilter: (req,file,cb) =>{
        const allowed = ['image/tiff', "image/tif", "image/svg", "image/heic", "image/raw", 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'application/pdf','video/mp4','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document',];
        if(allowed.includes(file.mimetype)){
            cb(null,true);

        }
        else{
            cb(new Error("Only image files are allowed"));
        }
    }
})

router.get('/', getMedia);
router.post('/upload', upload.single('file'), uploadMedia);
router.post('/convert/:id', convertImage);
router.get('/download/:id', downloadMedia);
router.delete('/:id', deleteMedia);

module.exports = router;