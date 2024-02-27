import { Server } from "socket.io";
import messageModel from '../dao/models/message.model.js';
import ProductManager from '../dao/db/ProductManager.js';
const productManager = new ProductManager();

const configureSocketIO = (httpServer) => {
    const io = new Server(httpServer);

    io.on('connection', async (socket) => {
        console.log('Cliente conectado');
        const products = await productManager.getProducts();
        socket.emit('products', products);
        socket.on('addProduct', async (data) => {
            try {
                const userEmail = data.userEmail;
        
                delete data.userEmail;
        
                const newProduct = await productManager.addProduct(data, userEmail);
        
                const updateProducts = await productManager.getProducts();
                io.emit('products', updateProducts);
        
                return newProduct;
            } catch (error) {
                console.log(error.message);
            }
        });
        socket.on('deleteProduct', async (data) => {
            try {
                const idDeleted = await productManager.deleteProduct(data);
                const updateProducts = await productManager.getProducts();
                io.emit('products', updateProducts);
                console.log(idDeleted);
                io.emit('idDeleted', idDeleted);
            } catch (err) {
                console.log('Error: ', err)
            }
        });
        const messages = await messageModel.find();
        socket.emit('messages', messages);
        socket.on('newMessage', async (data) => {
            try {
                const newMessage = new messageModel(data);
                await newMessage.save();
                const messages = await messageModel.find();
                socket.emit('messages', messages);
            } catch (err) {
                console.log('Error: ', err)
            }
        })
    });

    return io;
};

export default configureSocketIO;
