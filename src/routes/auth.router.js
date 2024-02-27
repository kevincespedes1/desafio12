
import express from 'express';
import publicRoutesMiddleware from '../middleware/publicRoutesMiddleware.js';
import privateRoutesMiddleware from '../middleware/privateRoutesMiddleware.js';
import generateToken from '../utils/tokenGenerator.js'
import transporter from '../utils/nodemailer.js';
import dotenv from 'dotenv';
import  UserController  from '../controllers/user.controller.mdb.js'
import { validateToken } from '../utils/tokenValidator.js';
import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';

const userController = new UserController()
dotenv.config();
const emailUser = process.env.EMAIL_USER;

const router = express.Router();

router.get('/register', publicRoutesMiddleware, (req, res) => {
    res.render('register');
});

router.get('/login', publicRoutesMiddleware, (req, res) => {
    res.render('login');
});

router.get('/profile', privateRoutesMiddleware, (req, res) => {
    const user = req.session.user;

    if (user) {
        let isAdmin = false;
        if (user.rol === 'admin') {
            isAdmin = true;
        }
        res.render('profile', { user: user, isAdmin: isAdmin });
    } else {
        res.redirect('/login');
    }
});
router.get('/reset-password', (req, res) => {
    res.render('resetpassword')
})
router.get('/password', (req, res) => {
    res.render('password')
})

router.get('/password/:token', async (req, res) => {
    const resetToken = req.params.token;

    try {
        if (!validateToken(resetToken)) {
            throw new Error('Token inválido');
        }

        const decodedToken = jwt.decode(resetToken);
        const userEmail = decodedToken.email;

        const user = await userController.findUserByEmail(userEmail);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        res.cookie('userEmail', userEmail, { maxAge: 900000, httpOnly: true }); 
        res.redirect(`/password`);
    } catch (error) {
        console.error('Error al procesar el token:', error);
        res.status(400).send('Error al procesar el token. Por favor, inténtalo de nuevo.');
    }
});


router.post('/password', async (req, res) => {
    const userEmail = req.cookies.userEmail;
    try {
        const user = await userController.findUserByEmail(userEmail);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const currentPassword = user.password; 

        const resetToken = req.body.token;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        if (newPassword !== confirmPassword) {
            return res.status(400).send('Las contraseñas no coinciden.');
        }
        const isSameAsCurrent = await bcrypt.compare(newPassword, currentPassword);
        if (isSameAsCurrent) {
            return res.status(400).send('La nueva contraseña no puede ser igual a la contraseña actual.');
        }


        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        await user.save();

        return res.send('Contraseña restablecida con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.');
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        return res.status(500).send('Hubo un error al restablecer la contraseña. Por favor, inténtalo de nuevo más tarde.');
    }
});




router.post('/reset-password', async (req, res) => {
    const userEmail = req.body.email;
    const user = await userController.findUserByEmail(userEmail);
    if (!user) {
        return res.status(404).send('El correo electrónico proporcionado no está registrado.');
    }


    const resetToken = generateToken(userEmail);
    const resetLink = `http://localhost:8080/password/${resetToken}`;
    const mailOptions = {
        from: emailUser,
        to: userEmail,
        subject: 'Restablecer Contraseña',
        html: `
        <div>
        <h1>Hola</h1>
        <br><br>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <br><br>
        <a style='cursor:pointer; color:blue;' href="${resetLink}">${resetLink}</a>
        <p>Si no solicitaste esto, ignora este correo electrónico.</p>
        <h3>El enlace de restablecimiento es válido por 1 hora.</h3>
        <p>Gracias</p>
        <p>kevin cespedes</p>
        </div>
        
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
            res.status(500).send('Hubo un error al enviar el correo electrónico.');
        } else {
            console.log('Correo electrónico enviado:', info.response);
            res.send('Se ha enviado un enlace de restablecimiento de contraseña al correo electrónico del usuario.');
        }
    });
});


router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/profile');
        }
        res.redirect('/login');
    });
});



export default router;


