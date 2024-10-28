const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const exphbs = require('express-handlebars');
const app = express();
const port = 8080;

// Configuración de Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Crear un servidor HTTP y un servidor de Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// Manejo de eventos de WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Emitir la lista de productos al nuevo cliente conectado
    socket.emit('updateProducts', readProducts());

    // Escuchar el evento para agregar un producto
    socket.on('addProduct', (newProduct) => {
        const addedProduct = addProduct(newProduct); // Asegúrate de que esta función esté disponible

        // Emitir la lista actualizada a todos los clientes conectados
        io.emit('updateProducts', readProducts());
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Rutas para las vistas
app.get('/', (req, res) => {
    const products = readProducts(); // Asegúrate de tener esta función disponible
    res.render('home', { products }); // Renderiza la vista home.handlebars con los productos
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts'); // Renderiza la vista realTimeProducts.handlebars
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});