/*
 * Reveal.js menu plugin
 * MIT licensed
 * (c) Greg Denehy 2020
 */
import { select, selectAll, loadCSSResource, create, dispatchEvent } from "./utils.js";

export default function Plugin() {
  
  var deck;
  var config;
  var options;
  var initialised = false;

  function scriptPath() {
    return import.meta.url.slice(0, import.meta.url.lastIndexOf('/') + 1);
  }

  function initOptions(config) {
    options = config.menu || {};
    options.path = options.path || scriptPath() || 'plugin/menu/';
    if (!options.path.endsWith('/')) {
      options.path += '/';
    }

    // Set defaults
    if (options.side === undefined) options.side = 'left';

    if (typeof options.titleSelector !== 'string')
      options.titleSelector = 'h1, h2, h3, h4, h5';

    if (typeof options.openButton === 'undefined') options.openButton = true;

    if (typeof options.sticky === 'undefined') options.sticky = false;

    if (typeof options.autoOpen === 'undefined') options.autoOpen = true;
  }

  var mouseSelectionEnabled = true;
  function disableMouseSelection() {
    mouseSelectionEnabled = false;
  }

  function reenableMouseSelection() {
    // wait until the mouse has moved before re-enabling mouse selection
    // to avoid selections on scroll
    select('nav.slide-menu').addEventListener('mousemove', function fn(e) {
      select('nav.slide-menu').removeEventListener('mousemove', fn);
      //XXX this should select the item under the mouse
      mouseSelectionEnabled = true;
    });
  }

  //
  // Keyboard handling
  //
  function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: _y, left: _x };
  }

  function visibleOffset(el) {
    var offsetFromTop = getOffset(el).top - el.offsetParent.offsetTop;
    if (offsetFromTop < 0) return -offsetFromTop;
    var offsetFromBottom =
      el.offsetParent.offsetHeight -
      (el.offsetTop - el.offsetParent.scrollTop + el.offsetHeight);
    if (offsetFromBottom < 0) return offsetFromBottom;
    return 0;
  }

  function keepVisible(el) {
    var offset = visibleOffset(el);
    if (offset) {
      disableMouseSelection();
      el.scrollIntoView(offset > 0);
      reenableMouseSelection();
    }
  }
  //
  // Utilty functions
  //

  function openMenu(event) {
    if (event) event.preventDefault();
    if (!isOpen()) {
      select('body').classList.add('slide-menu-active');
      select('.reveal').classList.add(
        'has-' + options.effect + '-' + options.side
      );
      select('.slide-menu').classList.add('active');
      select('.slide-menu-overlay').classList.add('active');

      // set item selections to match active items
      var items = selectAll('.slide-menu-panel li.active');
      items.forEach(function (i) {
        i.classList.add('selected');
        keepVisible(i);
      });
    }
  }

  function closeMenu(event, force) {
    if (event) event.preventDefault();
    if (!options.sticky || force) {
      select('body').classList.remove('slide-menu-active');
      select('.reveal').classList.remove(
        'has-' + options.effect + '-' + options.side
      );
      select('.slide-menu').classList.remove('active');
      select('.slide-menu-overlay').classList.remove('active');
      selectAll('.slide-menu-panel li.selected').forEach(function (i) {
        i.classList.remove('selected');
      });
    }
  }

  function isOpen() {
    return select('body').classList.contains('slide-menu-active');
  }

  function openItem(item, force) {
    var h = parseInt(item.getAttribute('data-slide-h'));
    var v = parseInt(item.getAttribute('data-slide-v'));

    if (!isNaN(h) && !isNaN(v)) {
      deck.slide(h, v);
    }

    var link = select('a', item);
    if (link) {
      if (
        force ||
        !options.sticky ||
        (options.autoOpen && link.href.startsWith('#')) ||
        link.href.startsWith(
          window.location.origin + window.location.pathname + '#'
        )
      ) {
        link.click();
      }
    }

    closeMenu();
  }

  function clicked(event) {
    if (event.target.nodeName !== 'A') {
      event.preventDefault();
    }
    openItem(event.currentTarget);
  }

  function highlightCurrentSlide() {
    var state = deck.getState();
    selectAll('li.slide-menu-item, li.slide-menu-item-vertical').forEach(
      function (item) {
        item.classList.remove('past');
        item.classList.remove('active');
        item.classList.remove('future');

        var h = parseInt(item.getAttribute('data-slide-h'));
        var v = parseInt(item.getAttribute('data-slide-v'));
        if (h < state.indexh || (h === state.indexh && v < state.indexv)) {
          item.classList.add('past');
        } else if (h === state.indexh && v === state.indexv) {
          item.classList.add('active');
        } else {
          item.classList.add('future');
        }
      }
    );
  }

  function initMenu() {
    if (!initialised) {
      var parent = select('.reveal').parentElement;
      var top = create('div', { class: 'slide-menu-wrapper' });
      parent.appendChild(top);
      var panels = create('nav', {
        class: 'slide-menu slide-menu--' + options.side
      });
      top.appendChild(panels);

      var overlay = create('div', { class: 'slide-menu-overlay' });
      top.appendChild(overlay);
      overlay.onclick = function () {
        closeMenu(null, true);
      };
      
      //
      // Slide links
      //
      function generateItem(type, section, i, h, v) {
        var link = '/#/' + h;
        if (typeof v === 'number' && !isNaN(v)) link += '/' + v;

        function text(selector, parent) {
          if (selector === '') return null;
          var el = parent ? select(selector, section) : select(selector);
          if (el) return el.textContent;
          return null;
        }
        var title =
          section.getAttribute('data-menu-title') ||
          text('.menu-title', section) ||
          text(options.titleSelector, section);

        if (!title) {
          type += ' no-title';
          title = 'Slide ' + (i + 1);
        }

        var item = create('li', {
          class: type,
          'data-item': i,
          'data-slide-h': h,
          'data-slide-v': v === undefined ? 0 : v
        });

        item.appendChild(
          create('span', { class: 'slide-menu-item-title' }, title)
        );

        return item;
      }

      function createSlideMenu() {
        if (select('section[data-markdown]:not([data-markdown-parsed])')) {
          setTimeout(createSlideMenu, 100);
          return;
        }
        var panel = create('div', {
          'data-panel': 'Slides',
          class: 'slide-menu-panel active-menu-panel'
        });
        panel.appendChild(create('ul', { class: 'slide-menu-items' }));
        panels.appendChild(panel);
        var items = select(
          '.slide-menu-panel[data-panel="Slides"] > .slide-menu-items'
        );
        var slideCount = 0;
        selectAll('.slides > section').forEach(function (section, h) {
          var subsections = selectAll('section', section);
          if (subsections.length > 0) {
            subsections.forEach(function (subsection, v) {
              var type =
                v === 0 ? 'slide-menu-item' : 'slide-menu-item-vertical';
              var item = generateItem(type, subsection, slideCount, h, v);
              if (item) {
                items.appendChild(item);
              }
              slideCount++;
            });
          } else {
            var item = generateItem(
              'slide-menu-item',
              section,
              slideCount,
              h
            );
            if (item) {
              items.appendChild(item);
            }
            slideCount++;
          }
        });
        selectAll('.slide-menu-item, .slide-menu-item-vertical').forEach(
          function (i) {
            i.onclick = clicked;
          }
        );
        highlightCurrentSlide();
      }

      createSlideMenu();
      deck.addEventListener('slidechanged', highlightCurrentSlide);

      //
      // Open menu options
      //
      if (options.openButton) {
        // add menu button
        var div = create('div', { class: 'slide-menu-button' });
        var link = create('a', { href: '#' });
        link.appendChild(create('span', null, "☰"));
        div.appendChild(link);
        select('.reveal').appendChild(div);
        div.onclick = openMenu;
      }

      //
      // Handle mouse overs
      //
      selectAll('.slide-menu-panel .slide-menu-items li').forEach(function (
        item
      ) {
        item.addEventListener('mouseenter', handleMouseHighlight);
      });

      function handleMouseHighlight(event) {
        if (mouseSelectionEnabled) {
          selectAll('.active-menu-panel .slide-menu-items li.selected').forEach(
            function (i) {
              i.classList.remove('selected');
            }
          );
          event.currentTarget.classList.add('selected');
        }
      }
    }

    initialised = true;
  }

  

  return {
    id: 'menu',
    init: async reveal => {
      deck = reveal;
      config = deck.getConfig();
      initOptions(config);
      await loadCSSResource(options.path + 'menu.css');
      initMenu();
      dispatchEvent('menu-ready');
    }
  };
}
