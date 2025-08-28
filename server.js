const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = false; // El juego no comienza hasta que haya 2 jugadores
let players = {
    'X': null, // ID del socket del jugador X
    'O': null  // ID del socket del jugador O
};

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
];

function checkWinner() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameActive = false;
            return board[a];
        }
    }
    return null;
}

function checkDraw() {
    return board.every(cell => cell !== null);
}

function sendGameState() {
    // Envía el estado del juego a todos los clientes.
    // También se envía el ID del jugador actual para que los clientes puedan mostrar el mensaje de "tu turno".
    io.emit('game state', { board, currentPlayer, gameActive, players });
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = false;
    sendGameState();
}

function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    // Asigna el rol al jugador si hay espacio
    if (!players['X']) {
        players['X'] = socket.id;
        console.log(`Jugador X se ha unido. ID: ${socket.id}`);
        socket.emit('player role', 'X');
    } else if (!players['O']) {
        players['O'] = socket.id;
        console.log(`Jugador O se ha unido. ID: ${socket.id}`);
        socket.emit('player role', 'O');
        gameActive = true; // Empieza el juego cuando el segundo jugador se une
        io.emit('game start');
    } else {
        console.log(`Observador se ha unido. ID: ${socket.id}`);
        // Los nuevos jugadores son observadores
    }

    sendGameState();

    socket.on('make move', (index) => {
        // Valida que la jugada provenga del jugador correcto
        if (!gameActive || board[index] !== null || players[currentPlayer] !== socket.id) {
            console.log(`Movimiento inválido de ${socket.id}. No es su turno o la casilla está ocupada.`);
            return;
        }
        
        board[index] = currentPlayer;
        
        const winner = checkWinner();
        if (winner) {
            io.emit('game over', { winner: currentPlayer, isDraw: false });
            return;
        }

        if (checkDraw()) {
            io.emit('game over', { winner: null, isDraw: true });
            return;
        }
        
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        sendGameState();
    });

    socket.on('reset game', () => {
        console.log('Juego reiniciado por un jugador.');
        resetGame();
    });

    socket.on('disconnect', () => {
        // Remueve al jugador desconectado de la lista
        if (socket.id === players['X']) {
            players['X'] = null;
            gameActive = false;
            console.log('Jugador X se ha desconectado.');
        } else if (socket.id === players['O']) {
            players['O'] = null;
            gameActive = false;
            console.log('Jugador O se ha desconectado.');
        }
        resetGame(); // Reinicia el juego si un jugador se va
    });
});

server.listen(PORT, () => {
    const localIp = getLocalIpAddress();
    console.log(`Servidor de Gato escuchando en el puerto: ${PORT}`);
    console.log(`Para jugar, usa la siguiente dirección en dos dispositivos diferentes:`);
    console.log(`http://${localIp}:${PORT}`);
});