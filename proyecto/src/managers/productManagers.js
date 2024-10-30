const fs = require('fs');
const path = require('path'); 

const productsFilePath = path.join(__dirname, '..', 'data', 'products.json'); 

function readProducts() {
    const data = fs.readFileSync(productsFilePath);
    return JSON.parse(data);
}

function writeProducts(products) {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

function getAllProducts(limit) {
    const products = readProducts();
    return limit ? products.slice(0, limit) : products;
}

function getProductById(pid) {
    const products = readProducts();
    return products.find(p => p.id === pid);
}

function addProduct(newProduct) {
    const currentProducts = readProducts();
    const newProductId = (currentProducts.length + 1).toString();
    newProduct.id = newProductId;
    currentProducts.push(newProduct);
    writeProducts(currentProducts);
    return newProduct;
}

function updateProduct(pid, updatedData) {
    let existingProducts = readProducts();
    let productIndex = existingProducts.findIndex(p => p.id === pid);

    if (productIndex === -1) {
        throw new Error('Producto no encontrado.');
    }

    const updatedProduct = { ...existingProducts[productIndex], ...updatedData };
    existingProducts[productIndex] = updatedProduct;
    writeProducts(existingProducts);
    
    return updatedProduct;
}

function deleteProduct(pid) {
    let existingProducts = readProducts();
    
    existingProducts = existingProducts.filter(p => p.id !== pid);
    
    writeProducts(existingProducts);
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
};