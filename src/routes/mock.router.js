import express from 'express';
import generateProducts from '../controllers/productMock.js';

const router = express.Router();


router.get('/mockingproducts', (req, res) => {
    try {
        const products = generateProducts();

        req.logger.info('Productos mock generados exitosamente');

        res.json(products);
    } catch (error) {
        req.logger.error('Error al generar productos mock:', error);

        res.status(500).send('Error al generar productos mock');
    }
});

export default router;
