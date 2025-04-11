import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import TreeMenu from 'reveal.js-tree-menu/index.js'

let deck = new Reveal({
  plugins: [Markdown, TreeMenu]
});
await deck.initialize();
