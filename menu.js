function create(tagName, attrs, content) {
  const el = document.createElement(tagName);
  if (attrs) {
    for (const n in attrs) el.setAttribute(n, attrs[n])
  }
  if (content) el.innerHTML = content;
  return el;
}

function toggleMenu(e) {
  if (e) e.preventDefault()
  
  const className = "active"
  const { classList } = document.querySelector('.slide-menu')
  const isActive = classList.contains(className)
  const button = document.querySelector(".slide-menu-button")

  if (isActive) {
    classList.remove(className)
    button.textContent = "☰"
  } else {
    classList.add(className)
    button.textContent = "✖"
  }
}

function highlightCurrentSlide(e = { indexh : 0, indexv : 0 }) {
  document.querySelectorAll('.slide-menu nav li > a').forEach(item => {
    const url = new URL(item.href)
    const currentHash = e ? `#/${e.indexh}${e.indexv ? '/' + e.indexv : ''}` : location.hash
    const method = (url.hash === currentHash) ? "add" : "remove"
    item.classList[method]('active')
  })
}

function createMenu() {
  const container = create('div', { class: 'slide-menu' })
  document.body.appendChild(container)
    
  const nav = create('nav')
  container.appendChild(nav)

  let slideCount = 0
  let currentType = 0
  let parent

  function generateItem(section, i, h, v) {
    let href = '#/' + h;
    if (v) href += '/' + v;
    
    const titleNode = section.querySelector('h1, h2, h3, h4, h5, h6')
    const title = titleNode ? titleNode.textContent : 'Slide ' + (i + 1)
    const titleType = titleNode ? Number(titleNode.tagName.charAt(1)) : currentType

    const li = create('li');
    const link = create('a', { href }, title)

    if (!parent) {
      parent = create("ul")
      nav.appendChild(parent)
    } else if (titleType > currentType) {
      const ol = create("ol")
      parent.appendChild(ol)
      ol.appendChild(li)
      parent = ol
    } else if (titleType < currentType && parent !== nav.firstElementChild) {
      parent = parent.parentNode.parentNode
    }

    currentType = titleType
    
    li.appendChild(link)
    parent.appendChild(li)
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

  function createButton() {
    let link = create('a', { href: '#', class: 'slide-menu-button' }, "☰")    
    document.body.appendChild(link)
    link.addEventListener("click", toggleMenu)
  }

  createButton()
}

export default {
  id: 'menu',
  init(reveal){
    createMenu()
    reveal.addEventListener('slidechanged', highlightCurrentSlide)
  }
}
