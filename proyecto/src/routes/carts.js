const express = require('express');
const fs = require('fs');
const router = express.Router();
const cartsFilePath = './data/carts.json';

function readCarts() {
    const data = fs.readFileSync(cartsFilePath);
    return JSON.parse(data);
}

function writeCarts(carts) {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
}

router.post('/', (req, res) => {
    const currentCarts = readCarts();
    const newCartId = (currentCarts.length + 1).toString();

    const newCart = {
        id: newCartId,
        products: []
    };

    currentCarts.push(newCart);
    writeCarts(currentCarts);

    return res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
    const cid = req.params.cid;
    const carts = readCarts();
    
    const cart = carts.find(c => c.id === cid);

    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).send('Carrito no encontrado.');
    }
});

router.post('/:cid/product/:pid', (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;

    let carts = readCarts();
    let cartIndex = carts.findIndex(c => c.id === cid);

    if (cartIndex === -1) {
        return res.status(404).send('Carrito no encontrado.');
    }

    let productInCartIndex = carts[cartIndex].products.findIndex(p => p.product === pid);

    if (productInCartIndex !== -1) {
        carts[cartIndex].products[productInCartIndex].quantity += 1;
    } else {
        carts[cartIndex].products.push({ product: pid, quantity: 1 });
    }

    writeCarts(carts);

    res.status(200).json(carts[cartIndex]);
});

module.exports = router;