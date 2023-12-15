document.getElementById('searchButton').addEventListener('click', function () {
    // Get the search query from the input field
    const searchQuery = document.getElementById('searchInput').value;
  
    // Get the current values of k and b from the sliders
    const kValue = parseFloat(document.getElementById('kSlider').value);
    const bValue = parseFloat(document.getElementById('bSlider').value);
  
    // Send a message to the content script to fetch paragraphs from the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'fetchParagraphs' }, function (paragraphs) {
        // Perform BM25 search logic with the fetched paragraphs and user-defined parameters
        const results = performBM25Search(searchQuery, paragraphs, kValue, bValue);
  
        // Display the results in the resultsContainer
        displayResults(results);
      });
    });
  });
  
  function performBM25Search(query, paragraphs, k1, b) {
    // Performs the BM25 Search on the given text  
  
    // Calculate average document length
    const avgDocLength = calculateAverageDocumentLength(paragraphs);
  
    // Calculate BM25 scores for each paragraph
    const results = paragraphs.map((paragraph, index) => {
      const score = calculateBM25Score(query, paragraph, k1, b, avgDocLength, paragraphs);
      return { id: index + 1, score: score, content: paragraph };
    });
  
    // Sorts the results by score in descending order and returns them
    results.sort((a, b) => b.score - a.score);
    return results;
  }
  
  function calculateBM25Score(query, documentContent, k1, b, avgDocLength, allDocuments) {
    // Calculates the BM25 score for a given document

    const queryTerms = query.toLowerCase().split(' ');
    const docTerms = documentContent.toLowerCase().split(' ');
  
    let score = 0;
  
    queryTerms.forEach(term => {
      const termFrequency = docTerms.filter(docTerm => docTerm === term).length;
      const docLength = docTerms.length;
      const documentFrequency = calculateDocumentFrequency(term, allDocuments);
      const numerator = termFrequency * (k1 + 1);
      const denominator = termFrequency + k1 * (1 - b + b * (docLength / avgDocLength));
  
      // IDF (inverse document frequency) component
      const idf = Math.log((allDocuments.length - documentFrequency + 0.5) / (documentFrequency + 0.5)) + 1;
  
      score += idf * (numerator / denominator);
    });
  
    return score;
  }
  
  function calculateAverageDocumentLength(documents) {
    // Calculates the average document length

    const totalLength = documents.reduce((total, doc) => total + doc.split(' ').length, 0);
    return totalLength / documents.length;
  }
  
  function calculateDocumentFrequency(term, allDocuments) {
    // Calculates the document frequency

    return allDocuments.filter(doc => doc.includes(term)).length;
  }
  
  function displayResults(results) {
    // Displays the results to the user

    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Clear previous results
  
    // Display each result in a list
    const ul = document.createElement('ul');
    results.forEach(result => {
      if (result.score > 0) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Document ${result.id}:</strong> ${result.content} (Score: ${result.score.toFixed(2)})`;
        ul.appendChild(li);
      }
    });
  
    resultsContainer.appendChild(ul);
  }
  

  // Function to update the displayed k value
document.getElementById('kSlider').addEventListener('input', function () {
    const kValue = parseFloat(document.getElementById('kSlider').value);
    document.getElementById('kValue').innerText = kValue.toFixed(2);
  });
  
  // Function to update the displayed b value
  document.getElementById('bSlider').addEventListener('input', function () {
    const bValue = parseFloat(document.getElementById('bSlider').value);
    document.getElementById('bValue').innerText = bValue.toFixed(2);
  });