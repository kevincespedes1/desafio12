import productModel from "../models/products.model.js";

export default class ProductManager {
constructor() {}

    getProducts = async (page, limit, category, available, sort) => {
        try {
            let queries = {};
            category ? (queries.category = category) : null;
            available ? (queries.status = available) : null;
            let sortOption = {};
            if (sort) {
                if (parseInt(sort) === 1) {
                    sortOption = { price: 1 };
                } else if (parseInt(sort) === -1) {
                    sortOption = { price: -1 };
                }
            }
            const products = await productModel.paginate(queries, {
                limit: parseInt(limit),
                page,
                lean: true,
                sort: sortOption,
            });

            products.hasPrevPage
                ? (products.prevLink = `/?page=${products.prevPage}`)
                : (products.prevLink = null);
            products.hasNextPage
                ? (products.nextLink = `/?page=${products.nextPage}`)
                : (products.nextLink = null);

            return products;
        } catch (error) {
            console.log(error);
        }
    };

    async addProduct(newProduct) {
        try {
            const product = new productModel({
                title: newProduct.title,
                category: newProduct.category,
                description: newProduct.description,
                price: newProduct.price,
                thumbnail: newProduct.thumbnail,
                code: newProduct.code,
                stock: newProduct.stock,
                status: newProduct.status,
                owner: newProduct.owner 
            });
            const savedProduct = await product.save();
            console.log('Producto añadido correctamente')
            return savedProduct;
        } catch (error) {
            throw new Error(`Error adding product: ${error.message}`);
        }
    }

    async getProductById(id) {
        try {
            const product = await productModel.findById(id);
            return product; 
        } catch (error) {
            console.error('Error al buscar el producto por ID:', error);
            throw new Error('Error al buscar el producto por ID'); 
        }
    }
    

    async updateProduct(id, newProduct) {
        const updateProduct = await productModel.findByIdAndUpdate(id, newProduct)
        if (!updateProduct) {
            return;
        } else {
            return updateProduct;
        };
    };

    async deleteProduct(id) {
        const deleteProduct = await productModel.findByIdAndDelete(id);
        if (!deleteProduct) {
            return;
        }
        else {
            return deleteProduct;
        };
    };


};