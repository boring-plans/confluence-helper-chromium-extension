const feedButton = document.getElementById('feedButton');
feedButton.onclick = ()=>{
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs)=>{
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                html: document.getElementById('htmlTextarea').value
            },
            (response)=>{
                window.close();
                alert(response.fromContent);
            }
        )
    })
}