function getCurrRange() {
  const selection = document.getSelection()
  if (selection.rangeCount) {
    return selection.getRangeAt(0)
  } else {
    const iframeList = document.querySelectorAll("iframe")
    for (const iframe of iframeList) {
      const iframeSelection = iframe.contentDocument.getSelection()
      if (iframeSelection.rangeCount) {
        return iframeSelection.getRangeAt(0)
      }
    }
  }
  return null
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  const currentRange = getCurrRange()
  if (message?.html && currentRange) {
    const container = currentRange.commonAncestorContainer
    let codeElement = null
    for (let node = container; node; node = node.parentNode) {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "CODE") {
        codeElement = node
        break
      }
    }
    if (codeElement) {
      codeElement.outerHTML = message.html
    } else {
      const div = document.createElement("div")
      div.innerHTML = message.html
      currentRange.deleteContents()
      currentRange.insertNode(div)
    }
    sendResponse("MD teleported!")
    return true
  }
})