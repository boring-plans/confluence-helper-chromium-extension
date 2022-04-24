chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  const [iframe] = document.getElementsByTagName('iframe');
  if(iframe){
    iframe.contentDocument.body.innerHTML = request.html;
  }
  sendResponse({ fromContent: "Feeded!" });
});
