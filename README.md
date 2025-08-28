# Gato Multijugador 

Juego de Gato (Tic-Tac-Toe) multijugador en tiempo real, diseñado para ser jugado en una red local (LAN) usando HTML, JavaScript y Node.js.

### 🎮 Cómo jugar

1.  **Inicia el servidor:** Abre tu terminal, navega a la carpeta del proyecto y ejecuta el siguiente comando:
    ```bash
    node server.js
    ```
2.  **Conéctate:** El servidor imprimirá una URL con tu dirección IP local (ej. `http://192.168.1.5:3000`). Abre esta URL en el navegador de dos dispositivos diferentes conectados a la misma red Wi-Fi.
3.  **Juega:** El juego comenzará automáticamente cuando el segundo jugador se conecte. El jugador `X` es el primero en moverse.

### 🛠️ Configuración e instalación

Antes de poder ejecutar el juego, necesitas tener Node.js instalado en tu computadora.

1.  **Clonar el repositorio:** En tu terminal, clona este proyecto desde GitHub:
    ```bash
    git clone [https://github.com/DiegoNatanael/DesarrolloSustentable.git](https://github.com/DiegoNatanael/DesarrolloSustentable.git)
    ```
2.  **Navegar al directorio del proyecto:**
    ```bash
    cd DesarrolloSustentable
    ```
3.  **Instalar las dependencias:** Instala las librerías necesarias (`express` y `socket.io`) ejecutando el siguiente comando:
    ```bash
    npm install
    ```
