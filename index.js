import express from 'express';
import operaciones from './crud.js';

import morgan from 'morgan';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const log = console.log;
const port = 3000;

// MIDDLEWARES GENERALES
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));

//DEJAR PÚBLICA LA CARPETA PUBLIC
app.use(express.static('public'));

//RUTA PÁGINA PRINCIPAL
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, './public/index.html'));
});

//Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
app.post('/api/usuario', async (req, res) => {
    try {
        const { nombre, balance } = req.body;
        if (!nombre || !balance) {
            return res.status(400).json({
                message: 'Debe proporcionar todos los valores requeridos [nombre, balance].'
            })
        }
        await operaciones.nuevoUsuario(nombre, balance);
        res.status(201).json({
            message: 'Nuevo usuario agregado con éxito.'
        })
    } catch (error) {
        log('Error al agregar usuario.', error)
        res.status(500).json({
            message: 'Error interno del servidor.'
        })
    }
});

//Devuelve todos los usuarios registrados con sus balances.
app.get('/api/usuarios', async (req, res) => {
    try {
        let response = await operaciones.obtenerUsuarios();
        res.status(200).json(response)
    } catch (error) {
        log('Error al intentar obtener el listado de usuarios.', error)
        res.status(500).json({
            message: 'Error interno del servidor.'
        })
    }
});

// Recibe los datos modificados de un usuario registrado y los actualiza.
app.put('/api/usuario', async (req, res) => {
    let id = req.query.id;
    let name = req.body.name;
    let balance = req.body.balance;
    try {
        const actualizarUsuario = await operaciones.actualizarUsuario(id, name, balance)
        if (actualizarUsuario) {
            res.status(200).json(actualizarUsuario);
        } else {
            res.status(404).send(`Error al actualizar usuario ${nombre}.`);
        }
    } catch (error) {
        log(error)
        res.status(500).send('Error interno del servidor al actualizar usuario.');
    }
});

// Recibe el id de un usuario registrado y lo elimina .
app.delete('/api/usuario', async (req, res) => {
    let id = req.query.id;
    try {
        const eliminarUsuario = await operaciones.eliminarUsuario(id)
        if (eliminarUsuario) {
            res.status(200).json(eliminarUsuario);
        } else {
            res.status(404).send(`Error al eliminar usuario.`);
        }
    } catch (error) {
        log(error)
        res.status(500).send('Error interno del servidor al eliminar usuario.');
    }
});



// /api/*

///Recibe los datos para realizar una nueva transferencia. 
app.post('/api/transferencia', async (req, res) => {
    let { emisor: idEmisor, receptor: idReceptor, monto } = req.body;
    if ((idEmisor == idReceptor) || (monto <= 0)) {
        return res.status(400).json({ message: 'Bad request.' })
    }
    try {
        const transferencia = await operaciones.transferencia(idEmisor, idReceptor, monto)
        if (transferencia) {
            res.status(200).json({ message: 'ok' });
        } else {
            res.status(404).json({ message: 'Error al realizar la transferencia.' });
        }
    } catch (error) {
        log(error)
        res.status(500).json({ message: 'Error interno del servidor al realizar la transferencia.' });
    }
});

//Devuelve todas las transferencias
app.get('/api/transferencias', async (req, res) => {
    try {
        let response = await operaciones.obtenerTransferencias();
        res.status(200).json(response)
    } catch (error) {
        log('Error al intentar obtener el listado de transferencias.', error)
        res.status(500).json({
            message: 'Error interno del servidor.'
        })
    }
});

app.all('*', (req, res) => {
    res.send('Página no encontrada.')
});

app.listen(port, () => {
    log(`Servidor ejecutándose en puerto ${port}.`)
});