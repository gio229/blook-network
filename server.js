const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

// Global Server Databases
const users = {}; 
const publicTrades = [];
const blackMarketAuctions = []; // Dynamic Black Market Database

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

io.on('connection', (socket) => {
    let sessionUser = null;

    // Fail-Safe Authenticator
    socket.on('auth', ({ username, password, action }) => {
        if (!username || !password) return socket.emit('auth_res', { success: false, msg: 'Missing fields.' });
        const key = username.toLowerCase().trim();

        if (action === 'signup') {
            if (users[key]) return socket.emit('auth_res', { success: false, msg: 'Username taken!' });
            users[key] = {
                username: username.trim(), password: password, coins: 5000, 
                blooks: ['Knight', 'Knight', 'Knight'], // Extra duplicates provided to test Merging immediately
                rank: (key === 'gio') ? 'admin' : 'user', lastWheel: 0
            };
        }

        const account = users[key];
        if (!account || account.password !== password) {
            return socket.emit('auth_res', { success: false, msg: 'Invalid login details!' });
        }

        sessionUser = account;
        socket.join('global_lobby');
        socket.emit('auth_res', { success: true, user: sessionUser, packs: PACKS });
        io.to('global_lobby').emit('sys_msg', `${sessionUser.username} connected.`);
        socket.emit('sync_trades', publicTrades);
        socket.emit('sync_auctions', blackMarketAuctions);
    });

    // Buying & Opening Packs
    socket.on('buy_pack', (packName) => {
        if (!sessionUser || !PACKS[packName]) return;
        const pack = PACKS[packName];
        if (sessionUser.coins < pack.cost) return socket.emit('sys_err', "Not enough tokens!");

        sessionUser.coins -= pack.cost;
        const reward = pack.blooks[Math.floor(Math.random() * pack.blooks.length)];
        sessionUser.blooks.push(reward);

        socket.emit('force_sync', sessionUser);
        socket.emit('pack_reward_reveal', reward);
        io.to('global_lobby').emit('update_leaderboard', getLeaderboardData());
    });

    // Hourly Token Wheel Engine
    socket.on('spin_wheel', () => {
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
    });

    // Duplicate Blook Merging Core Engine
    socket.on('merge_blooks', (blookName) => {
        if (!sessionUser) return;
        
        // Count how many copies the player actually owns
        const instances = sessionUser.blooks.filter(b => b === blookName);
        if (instances.length < 3) return socket.emit('sys_err', `You need at least 3 copies of ${blookName} to merge!`);

        // Remove 3 copies
        for(let i = 0; i < 3; i++) {
            sessionUser.blooks.splice(sessionUser.blooks.indexOf(blookName), 1);
        }

        // Tier Up Grade Progression Matrix Logic
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
    });

    // Black Market Auction House Posting Engine
    socket.on('post_auction', ({ blookName, price }) => {
        const costPrice = parseInt(price);
        if (!sessionUser || !sessionUser.blooks.includes(blookName) || isNaN(costPrice) || costPrice <= 0) return;

        sessionUser.blooks.splice(sessionUser.blooks.indexOf(blookName), 1);
        
        const newAuction = {
            id: Date.now().toString(),
            seller: sessionUser.username,
            item: blookName,
            cost: costPrice
        };
        
        blackMarketAuctions.push(newAuction);
        io.to('global_lobby').emit('sync_auctions', blackMarketAuctions);
        socket.emit('force_sync', sessionUser);
    });

    // Purchasing Items out of the Black Market Auction Board
    socket.on('buy_auction', (auctionId) => {
        if (!sessionUser) return;
        const idx = blackMarketAuctions.findIndex(a => a.id === auctionId);
        if (idx === -1) return;

        const auction = blackMarketAuctions[idx];
        if (auction.seller === sessionUser.username) return socket.emit('sys_err', "You can't buy your own auction!");
        if (sessionUser.coins < auction.cost) return socket.emit('sys_err', "Not enough tokens to purchase this item!");

        const sellerUser = users[auction.seller.toLowerCase()];
        
        // Finalize transaction transfers
        sessionUser.coins -= auction.cost;
        sessionUser.blooks.push(auction.item);
        if (sellerUser) sellerUser.coins += auction.cost;

        blackMarketAuctions.splice(idx, 1);
        io.to('global_lobby').emit('sync_auctions', blackMarketAuctions);
        socket.emit('force_sync', sessionUser);
        
        io.to('global_lobby').emit('sys_msg', `${sessionUser.username} bought ${auction.seller}'s ${auction.item} off the Black Market!`);
        io.to('global_lobby').emit('check_sync_broadcast', { target: auction.seller, data: sellerUser });
        io.to('global_lobby').emit('update_leaderboard', getLeaderboardData());
    });

    // Standard P2P Trade Gifting Engine
    socket.on('post_trade', (blookName) => {
        if (!sessionUser || !sessionUser.blooks.includes(blookName)) return;
        const newTrade = { id: Date.now().toString(), sender: sessionUser.username, item: blookName };
        publicTrades.push(newTrade);
        io.to('global_lobby').emit('sync_trades', publicTrades);
    });

    socket.on('claim_trade', (tradeId) => {
        if (!sessionUser) return;
        const index = publicTrades.findIndex(t => t.id === tradeId);
        if (index === -1) return;

        const trade = publicTrades[index];
        if (trade.sender === sessionUser.username) return;

        const senderKey = trade.sender.toLowerCase();
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
    });

    // Live Global Chat Module
    socket.on('send_chat', (text) => {
        if (!sessionUser || !text.trim()) return;
        io.to('global_lobby').emit('receive_chat', {
            username: sessionUser.username, rank: sessionUser.rank, text: text.trim()
        });
    });

    // Enhanced Custom Master Admin Command Injections
    socket.on('admin_action', ({ target, role, coins, blook }) => {
        if (!sessionUser || (sessionUser.rank !== 'admin' && sessionUser.rank !== 'mod')) return;
        const targetKey = target.toLowerCase().trim();
        const player = users[targetKey];

        if (player) {
            if (role) player.rank = role;
            if (coins) player.coins += parseInt(coins);
            if (blook) player.blooks.push(blook);
            io.to('global_lobby').emit('sys_msg', `Staff updated asset arrays for profile player: ${player.username}`);
            io.to('global_lobby').emit('check_sync_broadcast', { target: player.username, data: player });
            io.to('global_lobby').emit('update_leaderboard', getLeaderboardData());
        }
    });

    socket.on('request_leaderboard', () => {
        socket.emit('update_leaderboard', getLeaderboardData());
    });
});

function getLeaderboardData() {
    return Object.values(users)
        .map(u => ({ username: u.username, coins: u.coins, count: u.blooks.length }))
        .sort((a, b) => b.coins - a.coins)
        .slice(0, 10);
}

server.listen(3000, () => console.log('Network Active'));
