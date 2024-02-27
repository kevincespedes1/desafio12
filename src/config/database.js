import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI;
const db = mongoose.connection;

mongoose.connect(mongoURI, {})
    .then(() => console.log('Database conectedo'))
    .catch((error) => console.error('Error connecting to database:', error));

export { mongoose, db };
