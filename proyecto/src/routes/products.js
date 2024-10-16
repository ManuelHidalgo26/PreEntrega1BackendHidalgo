const express = require('express');
const fs = require('fs');
const router = express.Router();
const productsFilePath = './data/products.json';

function readProducts() {
    const data = fs.readFileSync(productsFilePath);
    return JSON.parse(data);
}

function writeProducts(products) {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || undefined;
    const products = readProducts();
    res.json(limit ? products.slice(0, limit) : products);
});

router.get('/:pid', (req, res) => {
    const pid = req.params.pid;
    
    const products = readProducts();
    const product = products.find(p => p.id === pid);
    
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

    const currentProducts = readProducts();
    const newProductId = (currentProducts.length + 1).toString();

    const newProduct = {
        id: newProductId,
        title,
        description,
        code,
        price: parseFloat(price),
        status: true,
        stock: Number(stock),
        category,
        thumbnails: thumbnails || [],
    };

    currentProducts.push(newProduct);
    writeProducts(currentProducts);

    return res.status(201).json(newProduct);
});

router.put('/:pid', (req, res) => {
    const productId = req.params.pid;
    
    let existingProducts = readProducts();
    let productIndex = existingProducts.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).send('Producto no encontrado.');
    }

    const updatedProduct = { ...existingProducts[productIndex], ...req.body };
    
    existingProducts[productIndex] = updatedProduct;
    
    writeProducts(existingProducts);
    
    res.json(updatedProduct);
});

router.delete('/:pid', (req, res) => {
    let existingProducts = readProducts();
    
    existingProducts = existingProducts.filter(p => p.id !== req.params.pid);
    
    writeProducts(existingProducts);
    
    res.status(204).send();
});

module.exports = router;