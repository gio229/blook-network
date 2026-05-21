# Blook Network - Premium Multiplayer Blook Collection Simulator

A real-time multiplayer Blook collection game built with Node.js, Express, and Socket.IO.

## Features

- 🎮 Real-time multiplayer gameplay
- 📦 9 premium packs with weighted drop rates
- 💰 Coin earning system with hourly wheel spins
- 🔄 Blook merging & fusion system
- 🏪 Auction house for player trading
- 💬 Live global chat
- 👑 Admin control panel
- 🔐 Secure authentication

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

3. Start the server:
```bash
npm start
```

4. Open `http://localhost:3000` in your browser

## How to Play

- **Create Account**: Sign up with username and password
- **Buy Packs**: Spend coins to open packs and get random Blooks
- **Merge Blooks**: Combine 3 copies of the same Blook to upgrade to a higher rarity
- **Auction House**: Buy and sell Blooks with other players
- **Spin Wheel**: Earn free coins once per hour
- **Chat**: Communicate with other players in real-time

## Pack Details

| Pack | Cost | Blooks |
|------|------|--------|
| Medieval | 20 | Knight, Queen, King, Wizard, Dragon |
| Space | 35 | Meteor, Astronaut, Alien, Star |
| Anime | 50 | Ninja, Samurai, Titan |
| Cyberpunk | 65 | Hacker Cat, Cyborg, AI Matrix, Cyber Core |
| Safari | 80 | Monkey, Zebra, Lion, Elephant |
| Aquatic | 100 | Goldfish, Shark, Kraken |
| Dino | 120 | Raptor, T-Rex, Ankylosaurus |
| Ice | 140 | Snowman, Yeti, Frost King |
| Chroma | 250 | Rainbow Slime, Neon Cat, Void Overlord |

## Rarity Levels

- 🔘 Common (Gray)
- 🔵 Rare (Blue)
- 🟣 Epic (Purple)
- 🟠 Legendary (Orange)
- 🌈 Chroma (Rainbow)

## Admin Commands

Admins can:
- Change player ranks
- Add coins to player accounts
- Gift Blooks to players

## License

MIT
