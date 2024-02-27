import express from 'express';
import  UserController  from '../controllers/user.controller.mdb.js';
import userModel from '../dao/models/user.model.js';
import checkPermissions from '../middleware/adminAndUser.js';
import  productModel  from '../dao/models/products.model.js';
import Ticket from '../dao/models/ticket.model.js'
import errorMessages from '../errors/errors.js';

const userController = new UserController()
const router = express.Router();

router.get('/', async (req, res) => {
    
    try {
        const userId = req.session.user._id;
        const cartData = await userController.getProductToCart(userId);
        req.logger.info(`Datos del carrito obtenidos para el usuario con ID: ${userId}`);

        res.render('cart', { cartData, userId });
    } catch (error) {
        console.error('Error al obtener los datos del carrito:', error);
        res.status(500).send(errorMessages.INTERNAL_SERVER_ERROR);
    }
});



router.post('/:cid/purchase',checkPermissions('purchase'), async (req, res) => {
    try {
        const { cid } = req.params;
        req.logger.info(`Iniciando compra para el usuario con ID: ${cid}`);

        const user = await userModel.findById(cid);
        if (!user) {
            return res.status(404).json({ success: false, message: errorMessages.USER_NOT_FOUND });
        }

        const cart = user.cart;

        const productsNotProcessed = [];

        let totalAmount = 0;

        for (const item of cart) {
            const product = await productModel.findById(item.productId);

            if (product && product.price) {
                const quantityInCart = item.quantity;
                const productPrice = product.price;
                const availableStock = product.stock;

                if (availableStock >= quantityInCart) {
                    product.stock -= quantityInCart;
                    await product.save();

                    totalAmount += productPrice * quantityInCart;
                } else {
                    productsNotProcessed.push(item.productId);
                }
            }
        }

        user.cart = user.cart.filter(item => productsNotProcessed.includes(item.productId));
        await user.save();

        const newTicket = new Ticket({
            amount: totalAmount,
            purchaser: user._id
        });

        await newTicket.save();
        req.logger.info(`Compra finalizada correctamente para el usuario con ID: ${cid}`);

        res.status(200).json({ success: true, totalAmount, productsNotProcessed, message: 'Compra finalizada correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: errorMessages.ERROR_FINALIZING_PURCHASE });
    }
});



router.delete('/:userId/products/:productId', checkPermissions('removeFromCart'), async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const user = await userModel.findById(userId);

        if (!user) {
            req.logger.warn(`Usuario no encontrado con ID: ${userId}`);
            return res.status(404).json({ success: false, message: errorMessages.USER_NOT_FOUND });
        }

        const productIndex = user.cart.findIndex(item => item.productId && item.productId._id.toString() === productId);

        if (productIndex === -1) {
            req.logger.warn(`Producto no encontrado en el carrito para el usuario con ID: ${userId}`);
            return res.status(404).json({ success: false, message: errorMessages.PRODUCT_NOT_FOUND });
        }

        user.cart.splice(productIndex, 1);

        await user.save();

        req.logger.info(`Producto eliminado del carrito correctamente para el usuario con ID: ${userId}`);
        return res.status(200).json({ success: true, message: 'Producto eliminado del carrito correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: errorMessages.INTERNAL_SERVER_ERROR });
    }
});



router.delete('/:cartId', checkPermissions('removeFromCart'), async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await userModel.findById(userId);
        if (!user) {
            req.logger.warn(`Usuario no encontrado con ID: ${userId}`);

            return res.status(404).json({ success: false, message: errorMessages.CART_NOT_FOUND });
        }

        user.cart = [];
        await user.save();
        req.logger.info(`Todos los productos han sido eliminados del carrito correctamente para el usuario con ID: ${userId}`);

        return res.status(200).json({ success: true, message: 'Todos los productos han sido eliminados del carrito correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: errorMessages.INTERNAL_SERVER_ERROR });
    }
});
export default router;
