const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const exphbs = require('express-handlebars');
const app = express();
const port = 8080;


app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


const server = http.createServer(app);
const io = new Server(server);


io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    
    socket.emit('updateProducts', readProducts());

    
    socket.on('addProduct', (newProduct) => {
        const addedProduct = addProduct(newProduct); // Asegúrate de que esta función esté disponible

        
        io.emit('updateProducts', readProducts());
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


app.get('/', (req, res) => {
    const products = readProducts(); 
    res.render('home', { products }); 
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts'); 
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});


server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});