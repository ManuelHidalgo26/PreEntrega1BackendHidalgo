const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    getProductById, 
    addProduct, 
    updateProduct, 
    deleteProduct 
} = require('../managers/productManager');

router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || undefined;
    
    const products = getAllProducts(limit);
    
    res.json(products);
});

router.get('/:pid', (req, res) => {
    const pid = req.params.pid;
    
    const product = getProductById(pid);
    
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Producto no encontrado.');
    }
});

router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).send({ 'message': 'Todos los campos son obligatorios' });
    }

    const newProduct = { title, description, code, price: parseFloat(price), status: true, stock: Number(stock), category, thumbnails: thumbnails || [] };

    const addedProduct = addProduct(newProduct);

    return res.status(201).json(addedProduct);
});

router.put('/:pid', (req, res) => {
    const productId = req.params.pid;

    try {
        const updatedProduct = updateProduct(productId, req.body);
        res.json(updatedProduct);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

router.delete('/:pid', (req, res) => {
    try {
        deleteProduct(req.params.pid);
        res.status(204).send();
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;