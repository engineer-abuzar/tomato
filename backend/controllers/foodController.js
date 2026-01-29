
import foodModel from '../models/foodModel.js'
import { PutObjectCommand , GetObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3"; 
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from '../config/s3.js';


//add food item

const addFood = async (req,res) =>{

    let image_filename = `${req.body.category}/${req.body.name}.${req.file.originalname.split('.')[1]}`;

   const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: image_filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };
     await s3.send(new PutObjectCommand(params))
    const food = new foodModel({
        name: req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })

    try {
        await food.save();
        res.json({success:true,message:'Food Added'})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Error'})
    }
}



// All food list

const listFood = async (req,res) =>{
    try {
        const foods = await foodModel.find({}).lean();
        const foodsWithImages=await Promise.all( foods.map(async(product)=>{
          

            const command=new GetObjectCommand({
                Bucket:process.env.AWS_BUCKET_NAME,
                Key:product.image
            })
            const imageUrl=await getSignedUrl(s3,command,{expiresIn:3600})
        
            return {
                ...product,
               picture:imageUrl,
                path:product.image
            }
        }))
        res.json({success:true,data:foodsWithImages})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Error'})
    }
}

// remove food item

const removeFood = async (req,res)=>{
    try {
        const food = await foodModel.findById(req.body.id);
        const command=new DeleteObjectCommand({
            Bucket:process.env.AWS_BUCKET_NAME,
            Key:req.body.Url
        })
      await s3.send(command)
        await foodModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:'Food Removed'})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Error'})
    }
}

export {addFood, listFood, removeFood}