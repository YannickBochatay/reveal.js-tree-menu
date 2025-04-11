const wrapperId = "main-reveal-wrapper"
const menuId = "slide-menu"
const classActive = "menu-active"
const currentPath = import.meta.url.slice(0, import.meta.url.lastIndexOf('/') + 1)

function create(tagName, attrs, content) {
  const el = document.createElement(tagName)
  if (attrs) {
    for (const n in attrs) {
      if (typeof attrs[n] === "function") el[n] = attrs[n]
      else el.setAttribute(n, attrs[n])
    }
  }
  if (content) el.innerHTML = content
  return el;
}

function loadCSS(href) {
  return new Promise((resolve, reject) => {
    const head = document.querySelector("head")
    const res = create("link", { rel : "stylesheet", onload : resolve, onerror : reject, href })
    head.appendChild(res)
  })
}

function highlightCurrentSlide(e = { indexh : 0, indexv : 0 }) {
  document.querySelectorAll(`#${menuId} li > a`).forEach(item => {
    const url = new URL(item.href)
    const currentHash = e ? `#/${e.indexh}${e.indexv ? '/' + e.indexv : ''}` : location.hash
    const method = (url.hash === currentHash) ? "add" : "remove"
    item.classList[method](classActive)
  })
}

function createButton() {
  let button = create('button', {
    id: menuId + "-button",
    "aria-expanded" : "false",
    "aria-controls" : menuId
  }, "☰")
  
  document.getElementById(wrapperId).appendChild(button)

  button.addEventListener("click", () => {
    document.getElementById(wrapperId).classList.add(classActive)
    button.setAttribute("aria-expanded", "true")
  })
}

function createMenu() {
  const container = create("div", { id : wrapperId})
  const reveal = document.querySelector(".reveal")
  const parentNode = reveal.parentNode
  const nav = create('nav', { id : menuId })

  container.appendChild(nav)
  container.appendChild(reveal)
  parentNode.appendChild(container)  

  let slideCount = 0
  let currentType
  let parent

  function createItem(section, i, h, v) {
    let href = '#/' + h;
    if (v) href += '/' + v;
    
    const titleNode = section.querySelector('h1, h2, h3, h4, h5, h6')
    const title = titleNode ? titleNode.textContent : 'Slide ' + (i + 1)
    const titleType = titleNode ? Number(titleNode.tagName.charAt(1)) : currentType

    const li = create('li')
    li.appendChild( create('a', { href }, title) )

    if (!currentType) {
      parent = create("ul")
      nav.appendChild(parent)
    } else if (titleType > currentType) {
      const ol = create("ol")
      parent.appendChild(ol)
      ol.appendChild(li)
      parent = ol
    } else if (titleType < currentType && parent !== nav.firstElementChild) {
      for (let i=0; i<currentType-titleType;i++) {
        parent = parent.parentNode
      }
    }
    
    parent.appendChild(li)
    currentType = titleType
    slideCount++
  }

  function createMenuItems() {
    if (document.querySelector('section[data-markdown]:not([data-markdown-parsed])')) {
      setTimeout(createMenuItems, 100)
      return
    }
    
    document.querySelectorAll('.slides > section').forEach((section, h) => {
      let subsections = section.querySelectorAll('section')

      if (subsections.length > 0) {
        subsections.forEach((subsection, v) => {
          createItem(subsection, slideCount, h, v)
        })
      } else createItem(section, slideCount, h)
    })
    highlightCurrentSlide()
  }

  createMenuItems()

  document.addEventListener("click", e => {
    if (
      !nav.contains(e.target) &&
      !e.target.matches("#" + menuId + "-button") &&
      !document.querySelector("aside.controls").contains(e.target)
    ) {
      document.getElementById(wrapperId).classList.remove(classActive)
      document.getElementById(menuId + '-button').setAttribute("aria-expanded", "true")
    }
  })
}

export default {
  id: 'tree-menu',
  async init(reveal) {
    if (location.search.includes("print-pdf")) return

    await loadCSS(currentPath + "styles.css")
    createMenu()
    createButton()
    reveal.layout()
    reveal.addEventListener('slidechanged', highlightCurrentSlide)

    const nav = document.getElementById(menuId)
    nav.addEventListener("transition-end", reveal.layout)
  }
}
