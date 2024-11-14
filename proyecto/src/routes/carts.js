const express = require('express');
const router = express.Router();
const { addProductToCart, removeProductFromCart } = require('../managers/cartManager');

router.post('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid; 
    const pid = req.params.pid; 

    try {
        const updatedCart = await addProductToCart(cid, pid); 
        const product = updatedCart.products.find(p => p.productId.toString() === pid); 

        if (!product) {
            return res.status(404).send('Producto no encontrado en el carrito.');
        }

        res.status(200).json({ success: true, product }); 
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ success: false, message: error.message }); 
    }
});

router.delete('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid; 
    const pid = req.params.pid; 

    try {
        const updatedCart = await removeProductFromCart(cid, pid); 
        res.status(200).json({ success: true, cart: updatedCart }); 
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ success: false, message: error.message }); 
    }
});

module.exports = router;