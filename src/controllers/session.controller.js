import UserModel from '../dao/models/user.model.js';
import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
    try {

        const { first_name, last_name, email, age, password } = req.body;

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        const newUser = new UserModel({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            cart: null
        });

        await newUser.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.user = user;
            res.cookie('user', JSON.stringify(user), { maxAge: 900000, httpOnly: true });
            res.redirect('/');
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductsView = async (req, res) => {
    try {
        const user = req.session.user;
        res.render('products', { user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        if (req.session.user) {
            res.status(200).json({ user: req.session.user });
        } else {
            res.status(401).json({ message: 'No hay usuario autenticado en la sesión' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
