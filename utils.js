export function dispatchEvent(type) {
  const event = new Event(type)
  document.querySelector('.reveal').dispatchEvent(event);
}

export function select(selector, el = document) {
  return el.querySelector(selector);
}

export function text(selector, parent) {
  if (selector === '') return null;
  var el = parent ? select(selector, parent) : select(selector);
  if (el) return el.textContent;
  return null;
}

export function selectAll(selector, el = document) {
  return el.querySelectorAll(selector);
}

export function create(tagName, attrs, content) {
  var el = document.createElement(tagName);
  if (attrs) {
    Object.getOwnPropertyNames(attrs).forEach(function (n) {
      el.setAttribute(n, attrs[n]);
    });
  }
  if (content) el.innerHTML = content;
  return el;
}

export function loadCSSResource(url) {
  return new Promise((resolve, reject) => {
    var head = document.querySelector('head');
    var res = document.createElement('link');
    res.rel = 'stylesheet';
    res.href = url;
    res.onload = resolve;
    res.onerror = reject;

    head.appendChild(res);
  })
}