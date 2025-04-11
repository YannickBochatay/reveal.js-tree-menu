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

class TreeMenu {

  #wrapperId = "main-reveal-wrapper"
  #menuId = "slide-menu"
  #classActive = "menu-active"

  #wrapperNode = null
  #navNode = null
  #buttonNode = null

  #slideCount = 0
  #currentType = null
  #currentParent = null

  get menuNode() { return this.#navNode }

  get buttonNode() { return this.#buttonNode }

  loadCSS() {
    const currentPath = import.meta.url.slice(0, import.meta.url.lastIndexOf('/') + 1)
    return loadCSS(currentPath + "styles.css")
  }
  
  create(reveal) {
    this.#createLayout()
    this.#createMenuItems()
    this.#createButton()
    this.#closeOnClickDocument()

    reveal.layout()
    reveal.addEventListener('slidechanged', this.#highlightCurrent.bind(this))
    this.#navNode.addEventListener("transition-end", reveal.layout)
  }

  open() {
    this.#wrapperNode.classList.add(this.#classActive)
    this.#buttonNode.setAttribute("aria-expanded", "true")
  }

  close() {
    this.#wrapperNode.classList.remove(this.#classActive)
    this.#buttonNode.setAttribute("aria-expanded", "false")
  }

  #highlightCurrent(e = { indexh : 0, indexv : 0 }) {
    this.#navNode.querySelectorAll("li > a").forEach(item => {
      const url = new URL(item.href)
      const currentHash = e ? `#/${e.indexh}${e.indexv ? '/' + e.indexv : ''}` : location.hash
      const method = (url.hash === currentHash) ? "add" : "remove"
      item.classList[method]("active")
    })
  }

  #createButton() {
    let button = create('button', {
      id: this.#menuId + "-button",
      "aria-expanded" : "false",
      "aria-controls" : this.#menuId
    }, "☰")
    
    this.#wrapperNode.appendChild(button)
    button.addEventListener("click", this.open.bind(this))
    this.#buttonNode = button
  }

  #closeOnClickDocument() {
    document.addEventListener("click", e => {
      if (
        !this.#navNode.contains(e.target) &&
        !e.target.matches("#" + this.#menuId + "-button") &&
        !document.querySelector("aside.controls").contains(e.target)
      ) this.close()
    })
  }

  #createItem(section, h, v) {
    let href = '#/' + h;
    if (v) href += '/' + v;
    
    const titleNode = section.querySelector('h1, h2, h3, h4, h5, h6')
    const title = titleNode ? titleNode.textContent : 'Slide ' + (this.#slideCount + 1)
    const titleType = titleNode ? Number(titleNode.tagName.charAt(1)) : this.#currentType

    const li = create('li')
    li.appendChild( create('a', { href }, title) )

    if (!this.#currentType) {
      this.#currentParent = create("ul")
      this.#navNode.appendChild(this.#currentParent)

    } else if (titleType > this.#currentType) {
      const ol = create("ol")
      this.#currentParent.appendChild(ol)
      ol.appendChild(li)
      this.#currentParent = ol

    } else if (titleType < this.#currentType && this.#currentParent !== this.#navNode.firstElementChild) {
      for (let i=0; i<this.#currentType-titleType;i++) {
        this.#currentParent = this.#currentParent.parentNode
      }
    }
    
    this.#currentParent.appendChild(li)
    this.#currentType = titleType
    this.#slideCount++
  }

  #createMenuItems() {
    document.querySelectorAll('.slides > section').forEach((section, h) => {
      let subsections = section.querySelectorAll('section')

      if (subsections.length > 0) {
        subsections.forEach((subsection, v) => this.#createItem(subsection, h, v))
      } else this.#createItem(section, h)
    })
    this.#highlightCurrent()
  }

  #createLayout() {
    this.#wrapperNode = create("div", { id : this.#wrapperId})
    const reveal = document.querySelector(".reveal")
    const parentNode = reveal.parentNode
    
    this.#navNode = create('nav', { id : this.#menuId })
    this.#wrapperNode.appendChild(this.#navNode)
    this.#wrapperNode.appendChild(reveal)
    parentNode.appendChild(this.#wrapperNode)  
  }
}

const treeMenu = new TreeMenu()

export default {
  id: 'tree-menu',
  async init(reveal) {
    if (location.search.includes("print-pdf")) return    
    await treeMenu.loadCSS()
    treeMenu.create(reveal)
  },
  treeMenu
}
