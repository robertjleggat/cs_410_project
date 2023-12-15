chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'fetchParagraphs') {
      const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim());
      sendResponse(paragraphs);
    }
  });