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
  const method = classList.contains(className) ? "remove" : "add"
  classList[method](className)
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
  const reveal = document.querySelector('.reveal')
  const parent = reveal.parentElement
  const wrapper = create('div', { class: 'slide-menu' })
  parent.insertBefore(wrapper, reveal)
    
  const nav = create('nav')
  wrapper.appendChild(nav)

  const ol = create('ol')
  nav.appendChild(ol)

  function generateItem(section, i, h, v) {
    let href = '#/' + h;
    if (v) href += '/' + v;
    
    const titleNode = section.querySelector('h1, h2, h3, h4, h5, h6', )
    const title = titleNode ? titleNode.textContent : 'Slide ' + (i + 1)
    const titleType = titleNode.tagName.charAt(1)

    let item = create('li');
    let link = create('a', { href }, title)
    link.style.paddingLeft = (titleType * 10) + "px"
    
    item.appendChild(link)
    ol.appendChild(item)

    return item;
  }

  function createMenuItems() {
    if (document.querySelector('section[data-markdown]:not([data-markdown-parsed])')) {
      setTimeout(createMenuItems, 100)
      return
    }
                
    let slideCount = 0

    document.querySelectorAll('.slides > section').forEach((section, h) => {

      let subsections = section.querySelectorAll('section')

      if (subsections.length > 0) {
        subsections.forEach((subsection, v) => {
          let item = generateItem(subsection, slideCount, h, v)
          if (item) ol.appendChild(item)
          slideCount++
        })
      } else {
        let item = generateItem(section, slideCount, h)
        ol.appendChild(item);
        slideCount++;
      }
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
