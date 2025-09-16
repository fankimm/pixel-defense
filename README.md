# Pixel Defense

A modern tower defense game built with HTML5 Canvas and vanilla JavaScript.

## 🎮 Play Now

Open `index.html` in a web browser or play the minified version: `pixel-defense-minified.html`

## 🚀 Features

- **7 Tower Types**: Basic, Sniper, Splash, Ice, Poison, Chain, Laser
- **8 Enemy Types**: Including special enemies like healers, splitters, stealth units, and bosses
- **Speed Control**: 1x, 2x, 4x, 8x game speed
- **Combo System**: Chain kills for bonus points
- **Particle Effects**: Visual feedback for all actions
- **Responsive Design**: Works on desktop and mobile
- **Funny Fake Ads**: Entertaining banner advertisements

## 🛠️ Development

### Project Structure
```
defense/
├── index.html              # Main game file
├── styles.css              # Game styles
├── js/                     # JavaScript modules
│   ├── config.js          # Game configuration
│   ├── GameEngine.js      # Main game loop
│   ├── Tower.js           # Tower logic
│   ├── Enemy.js           # Enemy logic
│   └── ...
├── tools/                  # Build tools
│   └── minify.js          # Minification script
└── pixel-defense-v*.html   # Versioned builds
```

### Building

To create a minified version:

```bash
./minify.sh
# or
node tools/minify.js
```

This creates:
- `pixel-defense-v[version].html` - Versioned build
- `pixel-defense-minified.html` - Latest build

### Version History

- v0.5: Improved ad display and mobile compatibility
- v0.4: iOS Safari optimizations
- v0.3: Mobile touch controls fixed
- v0.2: Added versioning system
- v0.1: Initial release

## 📱 Mobile Support

The game is fully responsive and supports touch controls. For best experience on iOS:
1. Host the game on a web server
2. Access via HTTP/HTTPS (not file://)

## 🎯 How to Play

1. Click "Start Wave" to begin
2. Click on the map to place towers
3. Click on towers to upgrade or sell
4. Survive as many waves as possible!

## 🏗️ Technologies

- HTML5 Canvas
- Vanilla JavaScript (ES6+)
- CSS3
- No external dependencies

## 📄 License

MIT License

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 🐛 Known Issues

- iOS Safari file:// protocol has limitations
- Best played on Chrome/Firefox for optimal performance

---

Made with ❤️ and pixels