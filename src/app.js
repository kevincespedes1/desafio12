import express from 'express';
import mongoose from 'mongoose';
import { db } from './config/database.js';
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import sessionFileStore from 'session-file-store';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import path from 'path';
import configureSocketIO from './config/socketConfig.js'; 
import { productsRouter } from './routes/products.router.js';
import homeRouter from './routes/home.router.js';
import realTimeRouter from './routes/realtimeproducts.router.js';
import sessionRouter from './routes/session.router.js';
import usersRouter from './routes/users.router.js'
import authRouter from './routes/auth.router.js';
import cartsRouter from './routes/carts.router.js'
import cartRouter from './routes/cart.router.js'
import mockRouter from './routes/mock.router.js';
import { addLogger } from './utils/logger.js';
const app = express();
const MongoStore = sessionFileStore(session);
const port = 8080;

app.use(session({
    secret: 'secret-key1234',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection, path: 'sessions' }), 
    cookie: { maxAge: 60 * 60 * 1000 } 
}));

initializePassport();
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(cookieParser());

app.use(addLogger);

app.use('/api/products', productsRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/users', usersRouter);
app.use('/api/carts', cartsRouter)
app.use('/realtimeproducts', realTimeRouter);
app.use('/cart', cartRouter)
app.use('/mock', mockRouter);
app.use('/', homeRouter);
app.use('/', authRouter); 

const httpServer = app.listen(port, () => {
        (`Server listening on port ${port}`);
});
const io = configureSocketIO(httpServer);

export default io;
