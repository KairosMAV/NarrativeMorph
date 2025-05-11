import React, { useState } from 'react';
import './App.css'; // Assuming you will create an App.css for basic styling

function App() {
  const [articleUrl, setArticleUrl] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setOutput('');
    // TODO: Replace with actual API call to backend
    // Example:
    // try {
    //   const response = await fetch('/api/transform_article', { // Adjust API endpoint as needed
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ url: articleUrl }),
    //   });
    //   const data = await response.json();
    //   setOutput(JSON.stringify(data, null, 2));
    // } catch (error) {
    //   setOutput(`Error: ${error.message}`);
    // }
    setTimeout(() => { // Simulate API call
      setOutput(`Processing article: ${articleUrl}\n(This is a mock output. Implement API call to backend.)`);
      setIsLoading(false);
    }, 2000);
    setArticleUrl('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Narrative Morph</h1>
        <p>Transform static articles into dynamic experiences.</p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="articleUrl">Article URL:</label>
            <input
              type="url"
              id="articleUrl"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="Enter article URL"
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Transform'}
          </button>
        </form>
        {output && (
          <section className="output-section">
            <h2>Output:</h2>
            <pre>{output}</pre>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
