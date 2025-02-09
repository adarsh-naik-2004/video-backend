import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req, res, cb){
        cb(null,'./public/temp')
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1])
    }
})

export const upload = multer({storage})