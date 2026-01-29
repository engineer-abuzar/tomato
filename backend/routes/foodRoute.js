import express from 'express'
import { addFood, listFood, removeFood } from '../controllers/foodController.js'
import multer from 'multer'
import upload from '../middleware/upload.js';
const foodRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
    destination:"uploads",
    filename: (req,file,cb)=>{
       
        return cb(null,`${req.body.name}.${file.originalname.split('.')[1]}`)
    }
})

// const upload = multer({storage:storage})
foodRouter.post('/add',upload.single('image'),addFood)
foodRouter.get('/list',listFood)
foodRouter.post('/remove', removeFood)

export default foodRouter;