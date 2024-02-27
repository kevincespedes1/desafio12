import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

class CartManager {
    constructor() {
        this.productsPath = path.join(__dirname, 'Products.json');

        this.cartPath = path.join(__dirname, 'cart.json');
    }

    async createCart() {
        let carts = await this.readFile();
    
        if (!Array.isArray(carts)) {
            carts = [];
        }
    
        const newCart = { id: this.generateUniqueId(), products: [] };
        carts.push(newCart); 
        await this.writeFile(carts);
        return newCart;
    }
    
    async addToCart(cartId, productId) {
        const carts = await this.readFile();
        const cartIndex = carts.findIndex(cart => cart.id === cartId);
        if (cartIndex === -1) {
            throw new Error('Cart not found');
        }
            const productIndex = carts[cartIndex].products.findIndex(product => product.code === productId);
        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity += 1; 
        } else {
            carts[cartIndex].products.push({ code: productId, quantity: 1 }); 
        }
    
        await this.writeFile(carts);
    }


    async findProductByCode(productCode) {
        try {
            const products = await this.readProductsFile();
            return products.find(product => product.code === productCode); 
        } catch (error) {
            throw new Error('Error finding product: ' + error.message);
        }
    }    
    async readProductsFile() {
        try {
            const productsData = await fs.promises.readFile(this.productsPath); 
            return JSON.parse(productsData);
        } catch (error) {
            throw new Error('Error reading products file: ' + error.message);
        }
    }
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    async writeFile(carts) {
        try {
            await fs.promises.writeFile(this.cartPath, JSON.stringify(carts), 'utf-8');
        } catch (error) {
            console.error('Error al escribir en el archivo:', error);
        }
    }

    async readProducts() {
        try {
            const fileData = await fs.promises.readFile(this.productsPath);
            return JSON.parse(fileData);
        } catch (error) {
            return [];
        }
    }

    async readFile() {
        try {
            const cartData = await fs.promises.readFile(this.cartPath, 'utf-8');
            if (!cartData) {
                return []; 
            }
            return JSON.parse(cartData);
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            return []; 
        }
    }
}

const cartManager = new CartManager();
export default cartManager;
