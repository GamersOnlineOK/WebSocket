const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs').promises;
const PORT = 3000;
let FILE_PRODUCTOS: {
    title: string;
    price: number;
    thumbnail: string;
    id: number;
    socketid: string;
}[] = [];
let CHAT_DB: {
    email: string;
    timestamp: string;
    mensaje: string;
}[] = [];
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);
app.get("/api/productos/vista", (req: any, res: any) => {
    res.render('../views/layout.ejs', {
        title: "Datos de productos",
        data: FILE_PRODUCTOS,
        existe: FILE_PRODUCTOS.length !== 0,
        message: CHAT_DB
    });
});

io.on('connection', (socket: any) => {
    socket.on('productos', (producto: any) => {
        io.emit('productos', producto);
        let newProducto = {
            title: producto.title,
            price: producto.price,
            thumbnail: producto.thumbnail,
            id: FILE_PRODUCTOS.length + 1,
            socketid: socket.id
        };
        FILE_PRODUCTOS.push(newProducto)
        console.log(FILE_PRODUCTOS)
    });


    socket.on('cliente-mensaje', async (message: any) => {
        io.emit('server-mensaje', message)
        let messageFile = {
            email: message.email,
            timestamp: message.timestamp,
            mensaje: message.mensaje
        }
        CHAT_DB.push(messageFile)
        console.log("Mensajes totales back")
        console.log(CHAT_DB)
        try {
            await fs.writeFile(`messages.txt`, JSON.stringify(CHAT_DB))
        } catch (err) {
            console.log('Error en la escritura del archivo ', err.error)
        }
    })
})


app.use(express.static('public'))




const srv = server.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`)
})

srv.on("error", (error: any) => console.log(`Error en servidor ${error}`))
