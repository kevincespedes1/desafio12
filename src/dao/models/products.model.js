import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
mongoose.pluralize(null)

const productsCollection = "products";

const productSchema = new mongoose.Schema({
    title: {type: String, required: true,},
    description: {type: String, required: true,},
    code: { type: String, required: true, unique: true,},
    price: {type: Number,required: true,},
    stock: {type: Number,required: true,},
    category: {type: String,required: true,},
    thumbnail: {type: String},
    status: {type: Boolean, default: true},
    owner: { type: String, default: 'admin' } 
});
productSchema.plugin(mongoosePaginate)

const productModel = mongoose.model(productsCollection, productSchema);
export default productModel