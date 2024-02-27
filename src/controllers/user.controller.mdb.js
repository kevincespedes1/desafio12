import UserModel from '../dao/models/user.model.js'
import productModel from "../dao/models/products.model.js";

export default class UserController {
    constructor() {
    }

    async toggleUserRole(req, res) {
        try {
            const userId = req.params.uid;
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.rol = user.rol === 'usuario' ? 'premium' : 'usuario';

            await user.save();
            return res.status(200).json({ message: 'User role updated successfully', user });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async addToCart(userId, productId) {
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const existingProductIndex = user.cart.findIndex(item => item.productId && item.productId._id.toString() === productId);
        if (existingProductIndex !== -1) {
            user.cart[existingProductIndex].quantity++;
        } else {
            user.cart.push({ productId, quantity: 1 });
        }

        await user.save();

        return { success: true, message: 'Producto agregado al carrito correctamente' };
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        return { success: false, message: 'Error interno del servidor' };
    }
}
    

    async removeFromCart(userId, cartItemId, productId) {
    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        user.cart = user.cart.filter(item => item._id.toString() !== cartItemId && item.productId.toString() !== productId);

        await user.save();

        return { success: true, message: 'Producto eliminado del carrito correctamente' };
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        return { success: false, message: 'Error interno del servidor' };
    }
}


    async getCart(userId) {
    try {
        const user = await UserModel.findById(userId).populate('cart.productId');
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        return { success: true, cart: user.cart };
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        return { success: false, message: 'Error interno del servidor' };
    }
}

    async getProductToCart(userId) {
    try {
        if (!userId) {
            throw new Error('ID de usuario no válido');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const cartData = [];
        for (const item of user.cart) {
            const product = await productModel.findById(item.productId);
            if (!product) {
                console.warn(`Producto con ID ${item.productId} no encontrado`);
                continue;
            }

            cartData.push({
                product: {
                    _id: product._id,
                    title: product.title,
                    category: product.category,
                    description: product.description,
                    price: product.price,
                    thumbnail: product.thumbnail,
                    code: product.code,
                    stock: product.stock,
                    status: product.status,
                    owner: product.owner
                },
                quantity: item.quantity
            });
        }

        return cartData;
    } catch (error) {
        console.error('Error al obtener datos del carrito:', error);
        throw error; 
    }
}
    
    

    async findUserByEmail(email) {
    try {
        const user = await UserModel.findOne({ email }); 
        return user; 
    } catch (error) {
        console.error('Error al buscar usuario por correo electrónico:', error);
        throw new Error('Error al buscar usuario por correo electrónico'); 
    }
}

    async getUsers() {
    try {
        const users = await UserModel.find().lean()
        return users
    } catch (err) {
        return err.message
    }

}

    async getUsersPaginated(page, limit) {
    try {
        return await UserModel.paginate(
            { rol: 'usuario' },
            { offset: (page * 1) - 0, limit: 5, lean: true }
        )
    } catch (err) {
        return err.message
    }
}
}

