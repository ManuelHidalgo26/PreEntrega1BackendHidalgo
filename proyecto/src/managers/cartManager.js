const Cart = require('../../models/cart');
const Product = require('../../models/product');
const { v4: uuidv4 } = require('uuid'); 

async function addCart() {
    const newCart = new Cart({ _id: uuidv4(), products: [] }); 
    await newCart.save();
    return newCart;
}

async function getCartById(cid) {
    return await Cart.findById(cid); 
}

async function addProductToCart(cid, pid) {
    const cart = await getCartById(cid); 

    if (!cart) throw new Error('Carrito no encontrado'); 

    
    const productExists = await Product.exists({ _id: pid }); 
    if (!productExists) throw new Error('Producto no encontrado');

    const productIndex = cart.products.findIndex(p => p.productId.toString() === pid); 

    if (productIndex > -1) {
        cart.products[productIndex].quantity += 1; 
    } else {
        cart.products.push({ productId: pid, quantity: 1 }); 
    }

    await cart.save(); 
    return cart; 
}

async function removeProductFromCart(cid, pid) {
    const cart = await getCartById(cid); 

    if (!cart) throw new Error('Carrito no encontrado'); 

    const initialLength = cart.products.length; // Longitud inicial para verificar si se eliminó un producto
    cart.products = cart.products.filter(p => p.productId.toString() !== pid); 

    await cart.save(); 

    if (cart.products.length === initialLength) { // Verifica si se eliminó algo
        throw new Error('No se pudo eliminar el producto.');
    }

    return cart; 
}


async function emptyCart(cid) {
    const cart = await getCartById(cid);

    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = []; 
    await cart.save(); 

    return cart;
}

module.exports = { addCart, getCartById, addProductToCart, removeProductFromCart, emptyCart };