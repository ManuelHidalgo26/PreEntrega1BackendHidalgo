
const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct } = require('../managers/productManagers');
const Product = require('../../models/product');

module.exports = (io) => {
    router.get('/:pid', async (req, res) => {
        const pid = req.params.pid; 
        
        try {
            const product = await getProductById(pid); 
            
            if (!product) {
                return res.status(404).send('Producto no encontrado.');
            }
            
            res.json(product); 
        } catch (error) {
            console.error("Error al obtener el producto:", error);
            res.status(500).send('Error al obtener el producto.');
        }
    });

    router.get('/', async (req, res) => {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
    
        let products = await getAllProducts(limit, page); 
    
        res.json({
            status: 'success',
            payload: products,
            totalPages: Math.ceil(await Product.countDocuments() / limit), 
            currentPage: page,
        });
    });
    

    router.post('/', async (req, res) => {
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).send({ 'message': 'Todos los campos son obligatorios' });
        }

        const newProduct = { 
            title, 
            description, 
            code, 
            price: parseFloat(price), 
            stock: Number(stock), 
            category, 
            thumbnails: thumbnails || [] 
        };

        const addedProduct = await addProduct(newProduct);

        
        io.emit('updateProducts', await getAllProducts()); 

        return res.status(201).json(addedProduct);
    });

    router.put('/:pid', async (req, res) => {
        const productId = req.params.pid;

        try {
            const updatedProduct = await updateProduct(productId, req.body);
            res.json(updatedProduct);
        } catch (error) {
            res.status(404).send(error.message);
        }
    });

    router.delete('/:pid', async (req, res) => {
        try {
            await deleteProduct(req.params.pid);
            
            io.emit('updateProducts', await getAllProducts()); 
            
            res.status(204).send();
        } catch (error) {
            res.status(404).send(error.message);
        }
    });

    return router; 
};