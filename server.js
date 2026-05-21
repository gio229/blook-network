const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

// Persistent runtime database
const users = {}; 
const publicTrades = [];

io.on('connection', (socket) => {
    let sessionUser = null;

    // Guaranteed Auth System
    socket.on('auth', ({ username, password, action }) => {
        const key = username.toLowerCase().trim();
        if (!username || !password) return socket.emit('auth_res', { success: false, msg: 'Missing fields' });

        if (action === 'signup') {
            if (users[key]) return socket.emit('auth_res', { success: false, msg: 'Username taken' });
            users[key] = {
                username, password, coins: 500, blooks: ['Knight'], rank: (key === 'gio') ? 'admin' : 'user'
            };
        }

        const account = users[key];
        if (!account || account.password !== password) {
            return socket.emit('auth_res', { success: false, msg: 'Invalid credentials' });
        }

        sessionUser = account;
        socket.join('global_lobby');
        socket.emit('auth_res', { success: true, user: sessionUser });
        io.to('global_lobby').emit('sys_msg', `${sessionUser.username} connected to the network.`);
        socket.emit('sync_trades', publicTrades);
    });

    // Real-Time Global Network Chat
    socket.on('send_chat', (text) => {
        if (!sessionUser) return;
        io.to('global_lobby').emit('receive_chat', {
            username: sessionUser.username, rank: sessionUser.rank, text: text.trim()
        });
    });

    // Real-Time Peer-to-Peer Trading Board
    socket.on('post_trade', (blookName) => {
        if (!sessionUser || !sessionUser.blooks.includes(blookName)) return;
        
        const newTrade = {
            id: Date.now().toString(), sender: sessionUser.username, item: blookName
        };
        publicTrades.push(newTrade);
        io.to('global_lobby').emit('sync_trades', publicTrades);
    });

    socket.on('claim_trade', (tradeId) => {
        if (!sessionUser) return;
        const index = publicTrades.findIndex(t => t.id === tradeId);
        if (index === -1) return;

        const trade = publicTrades[index];
        if (trade.sender === sessionUser.username) return socket.emit('sys_err', "You can't claim your own offer!");

        const senderKey = trade.sender.toLowerCase();
        const originalOwner = users[senderKey];

        if (originalOwner && originalOwner.blooks.includes(trade.item)) {
            // Transfer item
            originalOwner.blooks.splice(originalOwner.blooks.indexOf(trade.item), 1);
            sessionUser.blooks.push(trade.item);

            publicTrades.splice(index, 1);
            io.to('global_lobby').emit('sync_trades', publicTrades);
            
            // Notify target sockets
            io.to('global_lobby').emit('sys_msg', `${sessionUser.username} successfully acquired ${trade.sender}'s ${trade.item}!`);
            socket.emit('force_sync', sessionUser);
        }
    });

    // Master Permissions Panel
    socket.on('admin_action', ({ target, role, coins, blook }) => {
        if (!sessionUser || (sessionUser.rank !== 'admin' && sessionUser.rank !== 'mod')) return;
        const targetKey = target.toLowerCase().trim();
        const player = users[targetKey];

        if (player) {
            if (role) player.rank = role;
            if (coins) player.coins += parseInt(coins);
            if (blook) player.blooks.push(blook);
            io.to('global_lobby').emit('sys_msg', `Staff modified workspace settings for ${player.username}.`);
        }
    });
});

server.listen(3000, () => console.log('Live Server on Port 3000'));
