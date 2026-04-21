const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {convertImage, getHistory } = require('../controllers/imageController');

const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null, 'src/uploads/');
    },
    filename:(req,file,cb) =>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});

const upload = multer ({
    storage,
    limits:{fileSize: 5 * 1024 * 1024},
    fileFilter: (req,file,cb) =>{
        const allowed = ['image/tiff', "image/tif", "image/svg", "image/heic", "image/raw", 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
        if(allowed.includes(file.mimetype)){
            cb(null,true);

        }
        else{
            cb(new Error("Only image files are allowed"));
        }
    }
})

router.post("/convert", upload.single('image'),convertImage);
router.get('/history', getHistory);

module.exports = router;