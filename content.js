const states = {
  html: '',
}
const inlineElements = [
  'a', 'span', 'strong', 'em', 'b', 'i', 'u', 's', 'code',
  'abbr', 'cite', 'q', 'small', 'sub', 'sup', 'time', 'mark',
  'ruby', 'rt', 'rp'
]

chrome.runtime.onMessage.addListener(({ html, action }, _, sendResponse) => {
  if (action === 'teleport') {
    states.html = html
  } else if (action === 'init') {
    initializeMouseUp()
  }

  sendResponse("SUCCESS")
  return true
})

function showPasteBtn(event, offset, dom) {
  const { x, y } = event
  const div = document.createElement('div')
  const btnCancel = document.createElement('div')
  const btn = document.createElement('div')

  div.style.left = `${x + offset.x}px`
  div.style.top = `${y + offset.y}px`
  div.classList.add('paste-btn-wrapper')

  btn.classList.add('paste-btn')
  btn.innerText = "Teleport"
  btn.addEventListener('click', (ev) => {
    ev.stopPropagation()
    if (inlineElements.includes((event.target.tagName).toLowerCase())) {
      event.target.outerHTML = states.html
    } else {
      event.target.innerHTML = states.html
    }
    states.html = ''
    div.remove()
  })

  btnCancel.style.marginRight = '.37rem'
  btnCancel.classList.add('paste-btn', 'tonal')
  btnCancel.innerText = 'Forget It'
  btnCancel.addEventListener('click', (ev) => {
    ev.stopPropagation()
    states.html = ''
    div.remove()
  })

  function onClickOutside(ev) {
    ev.stopPropagation()
    if (!div.contains(ev.target)) {
      div.remove()
      dom.removeEventListener('click', onClickOutside)
    }
  }

  setTimeout(() => dom.addEventListener('click', onClickOutside))

  div.append(btnCancel)
  div.append(btn)
  document.body.append(div)
}

function addMouseUpListener(dom, posOffset = { x: 0, y: 0 }) {
  function domMouseListener(event) {
    const existsPasteBtn = document.querySelector('.paste-btn')
    if (!existsPasteBtn && states.html && event.target) {
      showPasteBtn(event, posOffset, dom)
    }
  }
  dom.removeEventListener('mouseup', domMouseListener)
  dom.addEventListener('mouseup', domMouseListener)
}

function initializeMouseUp() {
  addMouseUpListener(document)
  const iframeList = document.querySelectorAll("iframe")
  for (const iframe of iframeList) {
    addMouseUpListener(iframe.contentDocument, iframe.getBoundingClientRect())
  }
  console.info("[v1.0.3]T.MD's ready.")
}
