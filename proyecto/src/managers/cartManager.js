const fs = require('fs');
const path = require('path'); 

const productsFilePath = path.join(__dirname, '..', 'data', 'products.json'); 

function readCarts() {
    const data = fs.readFileSync(cartsFilePath);
    return JSON.parse(data);
}

function writeCarts(carts) {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
}

function addCart() {
    const currentCarts = readCarts();
    const newCartId = (currentCarts.length + 1).toString();

    const newCart = {
        id: newCartId,
        products: []
    };

    currentCarts.push(newCart);
    writeCarts(currentCarts);

    return newCart;
}

function getCartById(cid) {
    const carts = readCarts();
    
    return carts.find(c => c.id === cid);
}

function addProductToCart(cid, pid) {
    let carts = readCarts();
    
    let cartIndex = carts.findIndex(c => c.id === cid);

    if (cartIndex === -1) {
        throw new Error('Carrito no encontrado.');
    }

    let productInCartIndex = carts[cartIndex].products.findIndex(p => p.product === pid);

    if (productInCartIndex !== -1) {
        carts[cartIndex].products[productInCartIndex].quantity += 1;
    } else {
        carts[cartIndex].products.push({ product: pid, quantity: 1 });
    }

    writeCarts(carts);

    return carts[cartIndex];
}

module.exports = {
    addCart,
    getCartById,
    addProductToCart,
};