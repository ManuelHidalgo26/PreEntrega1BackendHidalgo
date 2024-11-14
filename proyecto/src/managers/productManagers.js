
const Product = require('../../models/product');

async function getAllProducts(limit, page) {
    try {
        return await Product.find().limit(limit).skip((page - 1) * limit).exec();
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
}


async function getProductById(pid) {
    return await Product.findById(pid).exec();
}

async function addProduct(newProduct) {
    const product = new Product(newProduct);
    return await product.save();
}

async function updateProduct(pid, updatedData) {
    return await Product.findByIdAndUpdate(pid, updatedData, { new: true }).exec();
}

async function deleteProduct(pid) {
    return await Product.findByIdAndDelete(pid).exec();
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
};