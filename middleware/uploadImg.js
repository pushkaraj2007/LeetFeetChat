const multer = require('multer');
const path = require('path');

let limits = {
    files: 1,
    fileSize: 1024 * 1024,
    };

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './static/user-img')
    },
    filename: (req, file, cb)=>{
        let fileName = Date.now() + path.extname(file.originalname)
        req.fileName = fileName
        req.filePath = file
        cb(null, fileName)
    }
})

const upload = multer({storage: storage, limits: limits})

module.exports = upload