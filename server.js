require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e6
});

// Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Server Databases
const users = {}; 
const publicTrades = [];
const blackMarketAuctions = [];
const activeSessions = new Map();

// 9 Premium Packs & Complete Drop Rates
const PACKS = {
    Medieval: { cost: 20, emoji: '🛡️', blooks: ['Knight', 'Queen', 'King', 'Wizard', 'Dragon'] },
    Space: { cost: 35, emoji: '🚀', blooks: ['Meteor', 'Astronaut', 'Alien', 'Star'] },
    Anime: { cost: 50, emoji: '⛩️', blooks: ['Ninja', 'Samurai', 'Titan'] },
    Cyberpunk: { cost: 65, emoji: '💾', blooks: ['Hacker Cat', 'Cyborg', 'AI Matrix', 'Cyber Core'] },
    Safari: { cost: 80, emoji: '🦁', blooks: ['Monkey', 'Zebra', 'Lion', 'Elephant'] },
    Aquatic: { cost: 100, emoji: '🐟', blooks: ['Goldfish', 'Shark', 'Kraken'] },
    Dino: { cost: 120, emoji: '🦖', blooks: ['Raptor', 'T-Rex', 'Ankylosaurus'] },
    Ice: { cost: 140, emoji: '❄️', blooks: ['Snowman', 'Yeti', 'Frost King'] },
    Chroma: { cost: 250, emoji: '✨', blooks: ['Rainbow Slime', 'Neon Cat', 'Void Overlord'] }
};

// Blook Details with Rarity & Drop Rates
const BLOOK_DETAILS = {
    'Knight': { emoji: '⚔️', rarity: 'common', rate: 50 }, 
    'Queen': { emoji: '👸', rarity: 'rare', rate: 25 }, 
    'King': { emoji: '👑', rarity: 'rare', rate: 15 }, 
    'Wizard': { emoji: '🧙', rarity: 'epic', rate: 10 },
    'Dragon': { emoji: '🐉', rarity: 'legendary', rate: 0 },
    'Meteor': { emoji: '☄️', rarity: 'common', rate: 60 }, 
    'Astronaut': { emoji: '👨‍🚀', rarity: 'rare', rate: 25 }, 
    'Alien': { emoji: '👽', rarity: 'epic', rate: 12 }, 
    'Star': { emoji: '⭐', rarity: 'legendary', rate: 3 },
    'Ninja': { emoji: '🥷', rarity: 'common', rate: 65 }, 
    'Samurai': { emoji: '👺', rarity: 'rare', rate: 25 }, 
    'Titan': { emoji: '👹', rarity: 'legendary', rate: 10 },
    'Hacker Cat': { emoji: '🐱‍💻', rarity: 'rare', rate: 50 }, 
    'Cyborg': { emoji: '🦿', rarity: 'epic', rate: 35 }, 
    'AI Matrix': { emoji: '💾', rarity: 'epic', rate: 12 }, 
    'Cyber Core': { emoji: '⚙️', rarity: 'legendary', rate: 3 },
    'Monkey': { emoji: '🐒', rarity: 'common', rate: 50 }, 
    'Zebra': { emoji: '🦓', rarity: 'rare', rate: 30 }, 
    'Lion': { emoji: '🦁', rarity: 'epic', rate: 15 }, 
    'Elephant': { emoji: '🐘', rarity: 'legendary', rate: 5 },
    'Goldfish': { emoji: '🐟', rarity: 'common', rate: 60 }, 
    'Shark': { emoji: '🦈', rarity: 'epic', rate: 35 }, 
    'Kraken': { emoji: '🦑', rarity: 'legendary', rate: 5 },
    'Raptor': { emoji: '🦖', rarity: 'common', rate: 50 }, 
    'T-Rex': { emoji: '🦕', rarity: 'epic', rate: 45 }, 
    'Ankylosaurus': { emoji: '🐢', rarity: 'legendary', rate: 5 },
    'Snowman': { emoji: '⛄', rarity: 'common', rate: 55 }, 
    'Yeti': { emoji: '🦍', rarity: 'epic', rate: 40 }, 
    'Frost King': { emoji: '🧊', rarity: 'legendary', rate: 5 },
    'Rainbow Slime': { emoji: '🌈', rarity: 'chroma', rate: 45 }, 
    'Neon Cat': { emoji: '🐱', rarity: 'chroma', rate: 40 }, 
    'Void Overlord': { emoji: '🧿', rarity: 'chroma', rate: 15 }
};

// Input Validation Helpers
function validateUsername(username) {
    return typeof username === 'string' && username.trim().length > 0 && username.length <= 20;
}

function validatePassword(password) {
    return typeof password === 'string' && password.length >= 3 && password.length <= 100;
}

function sanitizeUsername(username) {
    return username.toLowerCase().trim();
}

io.on('connection', (socket) => {
    let sessionUser = null;

    socket.on('auth', ({ username, password, action }) => {
        try {
            if (!validateUsername(username) || !validatePassword(password)) {
                return socket.emit('auth_res', { success: false, msg: 'Invalid credentials format.' });
            }

            const key = sanitizeUsername(username);

            if (action === 'signup') {
                if (users[key]) {
                    return socket.emit('auth_res', { success: false, msg: 'Username taken!' });
                }
                users[key] = {
                    username: username.trim(),
                    password: password,
                    coins: 5000,
                    blooks: ['Knight', 'Knight', 'Knight'],
                    rank: (key === 'gio') ? 'admin' : 'user',
                    lastWheel: 0,
                    createdAt: Date.now()
                };
            }

            const account = users[key];
            if (!account || account.password !== password) {
                return socket.emit('auth_res', { success: false, msg: 'Invalid login details!' });
            }

            sessionUser = account;
            activeSessions.set(socket.id, sessionUser);
            socket.join('global_lobby');
            socket.emit('auth_res', { success: true, user: sessionUser, packs: PACKS, blookDetails: BLOOK_DETAILS });
            io.to('global_lobby').emit('sys_msg', `${sessionUser.username} connected.`);
            socket.emit('sync_trades', publicTrades);
            socket.emit('sync_auctions', blackMarketAuctions);
        } catch (err) {
            console.error('Auth error:', err);
            socket.emit('auth_res', { success: false, msg: 'Server error during authentication.' });
        }
    });

    socket.on('buy_pack', (packName) => {
        try {
            if (!sessionUser || !PACKS[packName]) return;
            const pack = PACKS[packName];
            if (sessionUser.coins < pack.cost) {
                return socket.emit('sys_err', 'Not enough tokens!');
            }

            sessionUser.coins -= pack.cost;
            
            // Weighted drop rates calculation
            const blooks = pack.blooks;
            const weights = blooks.map(b => BLOOK_DETAILS[b].rate);
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;
            let selected = blooks[0];
            for(let i = 0; i < blooks.length; i++) {
                random -= weights[i];
                if(random <= 0) { selected = blooks[i]; break; }
            }
            
            sessionUser.blooks.push(selected);
            socket.emit('force_sync', sessionUser);
            socket.emit('pack_reward_reveal', selected);
            io.to('global_lobby').emit('update_leaderboard', getLeaderboardData());
        } catch (err) {
            console.error('Pack purchase error:', err);
            socket.emit('sys_err', 'Failed to purchase pack.');
        }
    });

    socket.on('spin_wheel', () => {
        try {
            if (!sessionUser) return;
            const now = Date.now();
            if (now - sessionUser.lastWheel < 3600000) {
                const rem = Math.ceil((3600000 - (now - sessionUser.lastWheel)) / 60000);
                return socket.emit('sys_err', `Wheel cooling down! Wait ${rem} minutes.`);
            }
            const prize = Math.floor(Math.random() * 500) + 150;
            sessionUser.coins += prize;
            sessionUser.lastWheel = now;
            socket.emit('force_sync', sessionUser);
            socket.emit('wheel_success', prize);
        } catch (err) {
            console.error('Wheel spin error:', err);
            socket.emit('sys_err', 'Failed to spin wheel.');
        }
    });

    socket.on('merge_blooks', (blookName) => {
        try {
            if (!sessionUser || typeof blookName !== 'string') return;
            
            const instances = sessionUser.blooks.filter(b => b === blookName);
            if (instances.length < 3) {
                return socket.emit('sys_err', `You need at least 3 copies of ${blookName} to merge!`);
            }

            for(let i = 0; i < 3; i++) {
                sessionUser.blooks.splice(sessionUser.blooks.indexOf(blookName), 1);
            }

            const TierUpgrades = {
                'Knight': 'Queen', 'Queen': 'King', 'King': 'Wizard', 'Wizard': 'Dragon',
                'Meteor': 'Astronaut', 'Astronaut': 'Alien', 'Alien': 'Star',
                'Ninja': 'Samurai', 'Samurai': 'Titan',
                'Hacker Cat': 'Cyborg', 'Cyborg': 'AI Matrix', 'AI Matrix': 'Cyber Core',
                'Monkey': 'Zebra', 'Zebra': 'Lion', 'Lion': 'Elephant',
                'Goldfish': 'Shark', 'Shark': 'Kraken',
                'Raptor': 'T-Rex', 'T-Rex': 'Ankylosaurus',
                'Snowman': 'Yeti', 'Yeti': 'Frost King',
                'Rainbow Slime': 'Neon Cat', 'Neon Cat': 'Void Overlord', 'Void Overlord': 'Void Overlord'
            };

            const upgradedReward = TierUpgrades[blookName] || 'Void Overlord';
            sessionUser.blooks.push(upgradedReward);
            
            socket.emit('force_sync', sessionUser);
            socket.emit('merge_success', { original: blookName, reward: upgradedReward });
        } catch (err) {
            console.error('Merge error:', err);
            socket.emit('sys_err', 'Failed to merge blooks.');
        }
    });

    socket.on('post_auction', ({ blookName, price }) => {
        try {
            const costPrice = parseInt(price);
            if (!sessionUser || !sessionUser.blooks.includes(blookName) || isNaN(costPrice) || costPrice <= 0) return;

            sessionUser.blooks.splice(sessionUser.blooks.indexOf(blookName), 1);
            
            const newAuction = {
                id: Date.now().toString(),
                seller: sessionUser.username,
                item: blookName,
                cost: costPrice,
                createdAt: Date.now()
            };
            
            blackMarketAuctions.push(newAuction);
            io.to('global_lobby').emit('sync_auctions', blackMarketAuctions);
            socket.emit('force_sync', sessionUser);
        } catch (err) {
            console.error('Auction posting error:', err);
            socket.emit('sys_err', 'Failed to post auction.');
        }
    });

    socket.on('buy_auction', (auctionId) => {
        try {
            if (!sessionUser) return;
            const idx = blackMarketAuctions.findIndex(a => a.id === auctionId);
            if (idx === -1) return;

            const auction = blackMarketAuctions[idx];
            if (auction.seller === sessionUser.username) {
                return socket.emit('sys_err', "You can't buy your own auction!");
            }
            if (sessionUser.coins < auction.cost) {
                return socket.emit('sys_err', 'Not enough tokens to purchase this item!');
            }

            const sellerUser = users[sanitizeUsername(auction.seller)];
            
            sessionUser.coins -= auction.cost;
            sessionUser.blooks.push(auction.item);
            if (sellerUser) sellerUser.coins += auction.cost;

            blackMarketAuctions.splice(idx, 1);
            io.to('global_lobby').emit('sync_auctions', blackMarketAuctions);
            socket.emit('force_sync', sessionUser);
            
            io.to('global_lobby').emit('sys_msg', `${sessionUser.username} bought ${auction.seller}'s ${auction.item} off the Black Market!`);
            if (sellerUser) io.to('global_lobby').emit('check_sync_broadcast', { target: auction.seller, data: sellerUser });
            io.to('global_lobby').emit('update_leaderboard', getLeaderboardData());
        } catch (err) {
            console.error('Auction purchase error:', err);
            socket.emit('sys_err', 'Failed to complete purchase.');
        }
    });

    socket.on('post_trade', (blookName) => {
        try {
            if (!sessionUser || !sessionUser.blooks.includes(blookName)) return;
            const newTrade = { 
                id: Date.now().toString(), 
                sender: sessionUser.username, 
                item: blookName,
                createdAt: Date.now()
            };
            publicTrades.push(newTrade);
            io.to('global_lobby').emit('sync_trades', publicTrades);
        } catch (err) {
            console.error('Trade posting error:', err);
            socket.emit('sys_err', 'Failed to post trade.');
        }
    });

    socket.on('claim_trade', (tradeId) => {
        try {
            if (!sessionUser) return;
            const index = publicTrades.findIndex(t => t.id === tradeId);
            if (index === -1) return;

            const trade = publicTrades[index];
            if (trade.sender === sessionUser.username) return;

            const senderKey = sanitizeUsername(trade.sender);
            const originalOwner = users[senderKey];

            if (originalOwner && originalOwner.blooks.includes(trade.item)) {
                originalOwner.blooks.splice(originalOwner.blooks.indexOf(trade.item), 1);
                sessionUser.blooks.push(trade.item);
                publicTrades.splice(index, 1);
                
                io.to('global_lobby').emit('sync_trades', publicTrades);
                io.to('global_lobby').emit('sys_msg', `${sessionUser.username} traded for ${trade.sender}'s ${trade.item}!`);
                socket.emit('force_sync', sessionUser);
                io.to('global_lobby').emit('check_sync_broadcast', { target: trade.sender, data: originalOwner });
            }
        } catch (err) {
            console.error('Trade claim error:', err);
            socket.emit('sys_err', 'Failed to claim trade.');
        }
    });

    socket.on('send_chat', (text) => {
        try {
            if (!sessionUser || !text || typeof text !== 'string') return;
            const cleanText = text.trim().substring(0, 500);
            if (!cleanText) return;
            
            io.to('global_lobby').emit('receive_chat', {
                username: sessionUser.username,
                rank: sessionUser.rank,
                text: cleanText,
                timestamp: Date.now()
            });
        } catch (err) {
            console.error('Chat error:', err);
        }
    });

    socket.on('admin_action', ({ target, role, coins, blook }) => {
        try {
            if (!sessionUser || (sessionUser.rank !== 'admin' && sessionUser.rank !== 'mod')) return;
            
            if (!validateUsername(target)) return;
            const targetKey = sanitizeUsername(target);
            const player = users[targetKey];

            if (player) {
                if (role && ['admin', 'mod', 'user'].includes(role)) player.rank = role;
                if (coins && !isNaN(parseInt(coins))) player.coins += parseInt(coins);
                if (blook && typeof blook === 'string') player.blooks.push(blook);
                
                io.to('global_lobby').emit('sys_msg', `Staff updated asset arrays for profile player: ${player.username}`);
                io.to('global_lobby').emit('check_sync_broadcast', { target: player.username, data: player });
                io.to('global_lobby').emit('update_leaderboard', getLeaderboardData());
            }
        } catch (err) {
            console.error('Admin action error:', err);
            socket.emit('sys_err', 'Failed to execute admin action.');
        }
    });

    socket.on('request_leaderboard', () => {
        try {
            socket.emit('update_leaderboard', getLeaderboardData());
        } catch (err) {
            console.error('Leaderboard error:', err);
        }
    });

    socket.on('disconnect', () => {
        if (sessionUser) {
            io.to('global_lobby').emit('sys_msg', `${sessionUser.username} disconnected.`);
        }
        activeSessions.delete(socket.id);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

function getLeaderboardData() {
    return Object.values(users)
        .map(u => ({ username: u.username, coins: u.coins, count: u.blooks.length }))
        .sort((a, b) => b.coins - a.coins)
        .slice(0, 10);
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🎮 Blook Network Active on port ${PORT}`));
