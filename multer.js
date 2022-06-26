const multer = require('multer');
const {getDate} = require('./DateFormat');

const storage = multer.diskStorage({
    destination(req, file, cb){
        if(req.body.pass){
            cb(null, 'photos/users/')
        } else {
            cb(null, 'photos/cars/')
        }

    },
    filename(req, file, cb){
        cb(null, getDate() + '-' + file.originalname)
    }
});


module.exports = multer({storage});