const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const { engine } = require('express-handlebars'); 
const fs = require('fs');

const app = express();
const port = 8080;

app.engine('handlebars', engine()); 
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'view'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

const productsRouter = require('./src/routes/products')(io); 
const cartsRouter = require('./src/routes/carts');

app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter); 

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    socket.emit('updateProducts', readProducts());

    socket.on('addProduct', (newProduct) => {
        addProduct(newProduct); 
        io.emit('updateProducts', readProducts());
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

app.get('/', (req, res) => {
    const products = readProducts(); 
    try {
        res.render('home', { products });
    } catch (error) {
        console.error("Error al renderizar la vista:", error);
        res.status(500).send('Error al renderizar la vista');
    }
});

app.get('/realtimeproducts', (req, res) => {
    try {
        res.render('realTimeProducts'); 
    } catch (error) {
        console.error("Error al renderizar la vista:", error);
        res.status(500).send('Error al renderizar la vista');
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

function readProducts() {
    const productsFilePath = path.join(__dirname, 'src', 'data', 'products.json'); 

    if (!fs.existsSync(productsFilePath)) {
        console.error('El archivo products.json no existe en la ruta esperada:', productsFilePath);
        return [];
    }

    try {
        const data = fs.readFileSync(productsFilePath); 
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer productos:", error);
        return [];
    }
}

function addProduct(newProduct) {
    try {
        const currentProducts = readProducts();
        const newProductId = (currentProducts.length + 1).toString();
        newProduct.id = newProductId;
        currentProducts.push(newProduct);
        fs.writeFileSync(path.join(__dirname, 'src','data', 'products.json'), JSON.stringify(currentProducts, null, 2)); 
        return newProduct;
    } catch (error) {
        console.error("Error al agregar producto:", error);
        throw new Error("No se pudo agregar el producto.");
    }
}