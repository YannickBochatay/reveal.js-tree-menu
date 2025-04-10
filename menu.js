function create(tagName, attrs, content) {
  const el = document.createElement(tagName);
  if (attrs) {
    for (const n in attrs) el.setAttribute(n, attrs[n])
  }
  if (content) el.innerHTML = content;
  return el;
}

function highlightCurrentSlide(e = { indexh : 0, indexv : 0 }) {
  document.querySelectorAll('.slide-menu nav li > a').forEach(item => {
    const url = new URL(item.href)
    const currentHash = e ? `#/${e.indexh}${e.indexv ? '/' + e.indexv : ''}` : location.hash
    const method = (url.hash === currentHash) ? "add" : "remove"
    item.classList[method]('active')
  })
}

function createContainer() {
  const container = create('div', { class: 'slide-menu' })
  document.body.appendChild(container)
}

function createButton() {
  let link = create('a', { href: '#', class: 'slide-menu-button' }, "☰")
  let container = document.querySelector('.slide-menu')
  container.appendChild(link)
  link.addEventListener("click", () => container.classList.add("active"))
}

function createMenu() {
      
  const nav = create('nav')
  document.querySelector('.slide-menu').appendChild(nav)

  let slideCount = 0
  let currentType
  let parent

  function generateItem(section, i, h, v) {
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
          generateItem(subsection, slideCount, h, v)
        })
      } else generateItem(section, slideCount, h)
    })
    highlightCurrentSlide()
  }

  createMenuItems()

  document.addEventListener("click", e => {
    if (!nav.contains(e.target) && !e.target.matches('.slide-menu-button')) {
      document.querySelector(".slide-menu").classList.remove("active")
    }
  })
}

export default {
  id: 'menu',
  init(reveal){
    createContainer()
    createButton()
    createMenu()
    reveal.addEventListener('slidechanged', highlightCurrentSlide)
  }
}
