const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const { engine } = require('express-handlebars');
const connectDB = require('./config/db'); 
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access'); 
const Handlebars = require('handlebars'); 
const session = require('express-session'); 
const { v4: uuidv4 } = require('uuid'); 
const { getAllProducts } = require('./src/managers/productManagers'); 
const Cart = require('./models/cart'); 


const app = express();
const port = 8080;

connectDB();

app.engine('handlebars', engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars) 
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'view'));



app.use(session({
    secret: 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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

    socket.on('addProduct', async (newProduct) => {
        try {
            const addedProduct = await addProduct(newProduct); 
            const products = await getAllProducts(); 
            io.emit('updateProducts', products);
            socket.emit('productAdded', { product: addedProduct });
        } catch (error) {
            console.error("Error al agregar producto:", error);
            socket.emit('error', 'No se pudo agregar el producto.');
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

app.get('/', async (req, res) => {
    try {
        let cartId = req.session.cartId;
        if (!cartId) {
            const newCartId = uuidv4();
            const newCart = new Cart({ _id: newCartId, products: [] });
            await newCart.save();
            req.session.cartId = newCart._id; 
            cartId = newCart._id; 
        }

        console.log("ID del carrito:", req.session.cartId); 

        const products = await getAllProducts(); 
        res.render('home', { products, cartId }); 
    } catch (error) {
        console.error("Error al renderizar la vista:", error);
        res.status(500).send('Error al renderizar la vista');
    }
});

app.get('/cart', async (req, res) => {
    try {
        const cartId = req.session.cartId; 
        if (!cartId) {
            return res.redirect('/'); 
        }

        const cart = await Cart.findById(cartId).populate('products.productId').exec(); 
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        console.log("Contenido del carrito:", cart); 
        res.render('cart', { cart }); 
    } catch (error) {
        console.error("Error al renderizar el carrito:", error);
        res.status(500).send('Error al renderizar el carrito');
    }
});

server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});