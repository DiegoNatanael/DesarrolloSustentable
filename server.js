const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Estado del juego
let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;

// Define las combinaciones ganadoras
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Función para verificar si alguien ha ganado
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

// Función para verificar si hay un empate
function checkDraw() {
    return board.every(cell => cell !== null);
}

// Envía el estado del juego a todos los clientes
function sendGameState() {
    io.emit('game state', { board, currentPlayer, gameActive });
}

// Resetea el juego
function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    sendGameState();
}

// Sirve los archivos estáticos
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('Un nuevo jugador se ha conectado.');
    // Envía el estado inicial al nuevo jugador
    sendGameState();

    // Escucha cuando un jugador hace un movimiento
    socket.on('make move', (index) => {
        if (!gameActive || board[index] !== null) {
            return; // Movimiento inválido
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
        
        // Cambia el turno
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        sendGameState();
    });

    // Escucha cuando se reinicia el juego
    socket.on('reset game', () => {
        console.log('Juego reiniciado por un jugador.');
        resetGame();
    });

    socket.on('disconnect', () => {
        console.log('Un jugador se ha desconectado.');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor de Gato escuchando en el puerto: ${PORT}`);
    console.log('Conéctate desde otros dispositivos usando la dirección IP local.');
});