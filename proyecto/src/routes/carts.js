const express = require('express');
const router = express.Router();
const { 
    addCart,
    getCartById,
    addProductToCart 
} = require('../managers/cartManager');

router.post('/', (req, res) => {
    const newCart = addCart();
    return res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
    const cid = req.params.cid;

    const cart = getCartById(cid);

    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).send('Carrito no encontrado.');
    }
});

router.post('/:cid/product/:pid', (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;

    try {
        const updatedCart = addProductToCart(cid, pid);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;