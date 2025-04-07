import socket from 'socket.io-client';

let socketInstance = null;
const eventListeners = new Map();

export const initializeSocket = (projectId) => {
    if (socketInstance) {
        // If socket already exists, disconnect it first
        socketInstance.disconnect();
    }

    socketInstance = socket(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
    });

    // Handle connection events
    socketInstance.on('connect', () => {
        console.log('Socket connected');
    });

    socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
    });

    return socketInstance;
};

export const receiveMessage = (eventName, callback) => {
    if (!socketInstance) {
        console.error('Socket not initialized');
        return;
    }

    // Store the callback for cleanup
    if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, []);
    }
    eventListeners.get(eventName).push(callback);

    socketInstance.on(eventName, callback);
};

export const sendMessage = (eventName, data) => {
    if (!socketInstance) {
        console.error('Socket not initialized');
        return;
    }

    socketInstance.emit(eventName, data);
};

export const disconnectSocket = () => {
    if (socketInstance) {
        // Remove all event listeners
        eventListeners.forEach((callbacks, eventName) => {
            callbacks.forEach(callback => {
                socketInstance.off(eventName, callback);
            });
        });
        eventListeners.clear();

        // Disconnect socket
        socketInstance.disconnect();
        socketInstance = null;
    }
};