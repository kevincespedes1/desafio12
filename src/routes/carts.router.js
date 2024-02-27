import express from 'express';
import cartManager from '../dao/fs/cartManager.js';
import fs from 'fs';
import UserController from '../controllers/user.controller.mdb.js'
import UserModel from '../dao/models/user.model.js';
import checkPermissions from '../middleware/adminAndUser.js';
import errorMessages from '../errors/errors.js';

const usersController = new UserController()
const router = express.Router();

// Ruta para agregar un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        req.logger.info(`Agregando producto con ID ${productId} al carrito con ID ${cartId}`);

        await cartManager.addToCart(cartId, productId);

        res.status(200).json({ message: 'Producto agregado al carrito con éxito' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
});

// Ruta para crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        req.logger.info('Creando un nuevo carrito');

        const newCart = await cartManager.createCart();

        res.status(201).json(newCart);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
});

// Ruta para obtener el contenido del carrito
router.get('/:cid/products', async (req, res) => {
    try {
        const cartId = req.params.cid;

        req.logger.info(`Obteniendo contenido del carrito con ID ${cartId}`);

        const cartContents = await cartManager.getCartContents(cartId);

        res.status(200).json(cartContents);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
});
// terminamos aca en fs

// aca obtengo el carrito

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await UserModel.findById(userId).populate('cart.productId');

        if (!user) {
            req.logger.warn(`Usuario no encontrado con ID: ${userId}`);
            return res.status(404).json({ success: false, message: errorMessages.USER_NOT_FOUND });
        }

        req.logger.info(`Obteniendo carrito del usuario con ID: ${userId}`);

        res.status(200).json({ success: true, cart: user.cart });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({ success: false, message: errorMessages.INTERNAL_SERVER_ERROR });
    }
});
// empezamos en db


router.post('/add/:productId/:quantity', checkPermissions('addToCart'), async (req, res) => {
    try {
        const { productId, quantity } = req.params;
        const userId = req.session.user._id;
        req.logger.info(`Agregando producto con ID ${productId} al carrito del usuario con ID ${userId}`);

        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).send(errorMessages.INVALID_QUANTITY);
        }
        const result = await usersController.addToCart(userId, productId);
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: errorMessages.CART_UPDATE_FAILED });
    }
});
// cart
router.delete('/:cid/products/:pid', checkPermissions('removeFromCart'), async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const user = await UserModel.findById(cid);
        if (!user) {
            req.logger.warn(`Usuario no encontrado con ID: ${cid}`);
            return res.status(404).json({ success: false, message: errorMessages.USER_NOT_FOUND });
        }

        const productIndex = user.cart.findIndex(item => item._id.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).json({
                success: false, message: errorMessages.PRODUCT_NOT_FOUND
            });
        }

        user.cart.splice(productIndex, 1);

        await user.save();

        req.logger.info(`Producto eliminado del carrito correctamente para el usuario con ID: ${cid}`);

        return res.status(200).json({ success: true, message: 'Producto eliminado del carrito correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: errorMessages.INTERNAL_SERVER_ERROR });
    }
});

router.put("/:cid/product/:pid", checkPermissions('addToCart'), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        if (!cid || !pid)
            return res.status(400).send({
                status: "error",
                message: { error: `Incomplete values` },
            });

        let updatedProductFromCart = await cartManager.updateProductFromCart(
            cid,
            pid,
            quantity
        );

        if (updatedProductFromCart.modifiedCount === 0) {
            return res.status(404).send({
                status: "error",
                error: `Could not update product from cart. No product ID ${pid} found in cart ID ${cid}.`,
            });
        }

        return res.status(200).send({
            status: "success",
            payload: updatedProductFromCart,
        });
    } catch (error) {
    }
});
router.put("/:cid", checkPermissions('addToCart'), async (req, res) => {
    try {
        const { cid } = req.params;
        const products = req.body;

        if (!cid || !products)
            return res.status(400).send({
                status: "error",
                message: { error: `Incomplete values` },
            });

        let updatedCart = await cartManager.updateCart(cid, products);

        if (updatedCart.modifiedCount === 0) {
            return res.status(404).send({
                status: "error",
                error: `Could not update cart. No cart found with ID ${cid} in the database`,
            });
        }

        return res.status(200).send({
            status: "success",
            payload: updatedCart,
        });
    } catch (error) {
    }
});
export default router;
