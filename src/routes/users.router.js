import { Router } from 'express';
import  UserController  from '../controllers/user.controller.mdb.js';

const router = Router();
const controller = new UserController();


router.get('/', async (req, res) => {
    try {
        const users = await controller.getUsers();

        req.logger.warn('Este contenido debería estar en archivo');

        res.status(200).send({ status: 'OK', data: users });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

router.put('/premium/:uid', controller.toggleUserRole);

export default router;
