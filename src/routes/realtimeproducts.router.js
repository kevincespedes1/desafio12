import express from 'express';
import ProductManager from '../dao/db/ProductManager.js';
import  UserController  from '../controllers/user.controller.mdb.js';
import isAuthenticated from '../middleware/checkSession.js';
import errorMessages from '../errors/errors.js';
import checkPermissions from '../middleware/adminAndUser.js';

const usersController = new UserController();
const productManager = new ProductManager();
const realTimeRouter = express.Router();


realTimeRouter.get('/', isAuthenticated,checkPermissions('read'), async (req, res) => {
    try {
        const { limit = 10, page = 1, category, available, sort } = req.query;
        const user = req.session.user;
        const userR = req.session.user.rol;
        const {
            docs: products,
            hasPrevPage,
            hasNextPage,
            nextPage,
            prevPage,
        } = await productManager.getProducts(page, limit, category, available, sort);

        const data = { user, userR};
        res.render('index', {
            products,
            page,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            data,
            user
        });
    } catch (error) {
        req.logger.error('Error al obtener los productos en tiempo real:', error);

        res.status(500).json({ success: false, message: errorMessages.INTERNAL_SERVER_ERROR });
    }
});

realTimeRouter.post('/enviarMensaje', isAuthenticated, checkPermissions('sendMessage'), async (req, res) => {
    try {
        const userId = req.session.user._id;
        const usuario = await usersController.findById(userId);
        if (usuario.rol === 'usuario') {
            res.status(200).json({ success: true, message: 'Mensaje enviado al chat correctamente' });
        } else {
            res.status(403).json({ success: false, message: 'No tiene permiso para enviar mensajes al chat' });
        }
    } catch (error) {
        req.logger.error('Error al enviar mensaje al chat:', error);

        res.status(500).json({ success: false, message: errorMessages.INTERNAL_SERVER_ERROR });
    }
});

export default realTimeRouter;
