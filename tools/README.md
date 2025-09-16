# Pixel Defense Tools

## Minification Tool

### Usage

From the project root directory, run:

```bash
node tools/minify.js
```

This will create `pixel-defense-minified.html` in the root directory.

### What it does

1. Reads `index.html`
2. Reads `styles.css`
3. Combines all JavaScript files from the `js/` folder
4. Creates a single HTML file with all assets inline
5. Outputs to `pixel-defense-minified.html`

### File size

The minified file is typically around 80-85KB, making it easy to share as a single file.

### When to use

- After making changes to the game
- Before sharing the game with others
- For deployment to static hosting
- For testing on mobile devices