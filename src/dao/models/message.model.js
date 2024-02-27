


import mongoose from "mongoose";
const { Schema } = mongoose;

const collectionMessage = 'message';
const messageSchema = new Schema({
    user: { type: String, required: true },
    message: String,
});


const messageModel = mongoose.model(collectionMessage, messageSchema);
export default messageModel;