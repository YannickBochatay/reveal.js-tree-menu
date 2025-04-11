# reveal.js-tree-menu
Tree menu plugin for reveal.js presentations.

Inspired by [https://github.com/denehyg/reveal.js-menu](https://github.com/denehyg/reveal.js-menu)

## Installation
```sh
npm install reveal.js-tree-menu
```

## Usage
```javascript
import Reveal from 'reveal.js'
import TreeMenu from 'reveal.js-tree-menu/index.js'

let deck = new Reveal({
  plugins: [TreeMenu]
})
await deck.initialize()
```

## Customization and API
```javascript
let deck = new Reveal({
  plugins: [TreeMenu]
})
await deck.initialize()

const { treeMenu } = deck.getPlugin("tree-menu")

treeMenu.buttonNode // Button DOM element
treeMenu.menuNode // Menu DOM element
treeMenu.open() // open menu
treeMenu.close() // close menu
```