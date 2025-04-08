/*
 * Reveal.js menu plugin
 * MIT licensed
 * (c) Greg Denehy 2020
 */

const Plugin = () => {
  
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

    if (options.numbers === undefined) options.numbers = false;

    if (typeof options.titleSelector !== 'string')
      options.titleSelector = 'h1, h2, h3, h4, h5';

    if (options.markers === undefined) options.markers = true;
    
    if (typeof options.openButton === 'undefined') options.openButton = true;

    if (typeof options.openSlideNumber === 'undefined')
      options.openSlideNumber = false;

    if (typeof options.keyboard === 'undefined') options.keyboard = true;

    if (typeof options.sticky === 'undefined') options.sticky = false;

    if (typeof options.autoOpen === 'undefined') options.autoOpen = true;

    if (typeof options.delayInit === 'undefined') options.delayInit = false;

    if (typeof options.openOnInit === 'undefined') options.openOnInit = false;
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

  function openPanel(event, ref) {
    openMenu(event);
    var panel = ref;
    if (typeof ref !== 'string') {
      panel = event.currentTarget.getAttribute('data-panel');
    }
    select('.slide-menu-toolbar > li.active-toolbar-button').classList.remove(
      'active-toolbar-button'
    );
    select('li[data-panel="' + panel + '"]').classList.add(
      'active-toolbar-button'
    );
    select('.slide-menu-panel.active-menu-panel').classList.remove(
      'active-menu-panel'
    );
    select('div[data-panel="' + panel + '"]').classList.add(
      'active-menu-panel'
    );
  }

  function openItem(item, force) {
    var h = parseInt(item.getAttribute('data-slide-h'));
    var v = parseInt(item.getAttribute('data-slide-v'));
    var transition = item.getAttribute('data-transition');

    if (!isNaN(h) && !isNaN(v)) {
      deck.slide(h, v);
    }

    if (transition) {
      deck.configure({ transition: transition });
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

  function matchRevealStyle() {
    var revealStyle = window.getComputedStyle(select('.reveal'));
    var element = select('.slide-menu');
    element.style.fontFamily = revealStyle.fontFamily;
    //XXX could adjust the complete menu style to match the theme, ie colors, etc
  }

  var buttons = 0;
  function initMenu() {
    if (!initialised) {
      var parent = select('.reveal').parentElement;
      var top = create('div', { class: 'slide-menu-wrapper' });
      parent.appendChild(top);
      var panels = create('nav', {
        class: 'slide-menu slide-menu--' + options.side
      });
      if (typeof options.width === 'string') {
        if (
          ['normal', 'wide', 'third', 'half', 'full'].indexOf(options.width) !=
          -1
        ) {
          panels.classList.add('slide-menu--' + options.width);
        } else {
          panels.classList.add('slide-menu--custom');
          panels.style.width = options.width;
        }
      }
      top.appendChild(panels);
      matchRevealStyle();
      var overlay = create('div', { class: 'slide-menu-overlay' });
      top.appendChild(overlay);
      overlay.onclick = function () {
        closeMenu(null, true);
      };

      var toolbar = create('ol', { class: 'slide-menu-toolbar' });
      select('.slide-menu').appendChild(toolbar);

      function addToolbarButton(title, ref, icon, style, fn, active) {
        var attrs = {
          'data-button': '' + buttons++,
          class:
            'toolbar-panel-button' + (active ? ' active-toolbar-button' : '')
        };
        if (ref) {
          attrs['data-panel'] = ref;
        }
        var button = create('li', attrs);

        if (icon.startsWith('fa-')) {
          button.appendChild(create('i', { class: style + ' ' + icon }));
        } else {
          button.innerHTML = icon + '</i>';
        }
        button.appendChild(create('br'), select('i', button));
        button.appendChild(
          create('span', { class: 'slide-menu-toolbar-label' }, title),
          select('i', button)
        );
        button.onclick = fn;
        toolbar.appendChild(button);
        return button;
      }

      addToolbarButton('Slides', 'Slides', 'fa-images', 'fas', openPanel, true);

      if (options.custom) {
        options.custom.forEach(function (element, index, array) {
          addToolbarButton(
            element.title,
            'Custom' + index,
            element.icon,
            null,
            openPanel
          );
        });
      }

      var button = create('li', {
        id: 'close',
        class: 'toolbar-panel-button'
      });
      button.appendChild(create('i', { class: 'fas fa-times' }));
      button.appendChild(create('br'));
      button.appendChild(
        create('span', { class: 'slide-menu-toolbar-label' }, 'Close')
      );
      button.onclick = function () {
        closeMenu(null, true);
      };
      toolbar.appendChild(button);

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

        if (options.markers) {
          item.appendChild(
            create('i', { class: 'fas fa-check-circle fa-fw past' })
          );
          item.appendChild(
            create('i', {
              class: 'fas fa-arrow-alt-circle-right fa-fw active'
            })
          );
          item.appendChild(
            create('i', { class: 'far fa-circle fa-fw future' })
          );
        }

        if (options.numbers) {
          // Number formatting taken from reveal.js
          var value = [];
          var format = 'h.v';

          // Check if a custom number format is available
          if (typeof options.numbers === 'string') {
            format = options.numbers;
          } else if (typeof config.slideNumber === 'string') {
            // Take user defined number format for slides
            format = config.slideNumber;
          }

          switch (format) {
            case 'c':
              value.push(i + 1);
              break;
            case 'c/t':
              value.push(i + 1, '/', deck.getTotalSlides());
              break;
            case 'h/v':
              value.push(h + 1);
              if (typeof v === 'number' && !isNaN(v)) value.push('/', v + 1);
              break;
            default:
              value.push(h + 1);
              if (typeof v === 'number' && !isNaN(v)) value.push('.', v + 1);
          }

          item.appendChild(
            create(
              'span',
              { class: 'slide-menu-item-number' },
              value.join('') + '. '
            )
          );
        }

        item.appendChild(
          create('span', { class: 'slide-menu-item-title' }, title)
        );

        return item;
      }

      function createSlideMenu() {
        if (
          !document.querySelector(
            'section[data-markdown]:not([data-markdown-parsed])'
          )
        ) {
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
        } else {
          // wait for markdown to be loaded and parsed
          setTimeout(createSlideMenu, 100);
        }
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

      if (options.openSlideNumber) {
        var slideNumber = select('div.slide-number');
        slideNumber.onclick = openMenu;
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

    if (options.openOnInit) {
      openMenu();
    }

    initialised = true;
  }

  function dispatchEvent(type) {
    const event = new Event("menu-ready")
    document.querySelector('.reveal').dispatchEvent(event);
  }

  function select(selector, el = document) {
    return el.querySelector(selector);
  }

  function selectAll(selector, el = document) {
    return el.querySelectorAll(selector);
  }

  function create(tagName, attrs, content) {
    var el = document.createElement(tagName);
    if (attrs) {
      Object.getOwnPropertyNames(attrs).forEach(function (n) {
        el.setAttribute(n, attrs[n]);
      });
    }
    if (content) el.innerHTML = content;
    return el;
  }

  // modified from math plugin
  function loadCSSResource(url) {
    return new Promise((resolve, reject) => {
      var head = document.querySelector('head');
      var resource = document.createElement('link');
      resource.rel = 'stylesheet';
      resource.href = url;
      resource.onload = resolve;
      resource.onerror = reject;
  
      head.appendChild(resource);
    })
  }

  function loadPlugin() {
    // does not support IE8 or below
    var supported = true;

    // do not load the menu in the upcoming slide panel in the speaker notes
    if (
      deck.isSpeakerNotes() &&
      window.location.search.endsWith('controls=false')
    ) {
      supported = false;
    }

    if (supported) {
      if (!options.delayInit) initMenu();
      dispatchEvent('menu-ready');
    }
  }

  return {
    id: 'menu',
    init: async reveal => {
      deck = reveal;
      config = deck.getConfig();
      initOptions(config);
      await loadCSSResource(options.path + 'menu.css');
      loadPlugin();
    }
  };
};

export default Plugin;
