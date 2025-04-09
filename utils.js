export function dispatchEvent(type) {
  const event = new Event(type)
  document.querySelector('.reveal').dispatchEvent(event);
}

export function select(selector, el = document) {
  return el.querySelector(selector);
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
    var resource = document.createElement('link');
    resource.rel = 'stylesheet';
    resource.href = url;
    resource.onload = resolve;
    resource.onerror = reject;

    head.appendChild(resource);
  })
}