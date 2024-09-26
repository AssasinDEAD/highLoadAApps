import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [dataNoCache, setDataNoCache] = useState(null);
  const [dataCache, setDataCache] = useState(null);
  const [performanceData, setPerformanceData] = useState({ noCacheTime: null, cacheTime: null });
  const [loadingNoCache, setLoadingNoCache] = useState(false);
  const [loadingCache, setLoadingCache] = useState(false);
  const [error, setError] = useState(null);

  const fetchDataNoCache = async () => {
    setLoadingNoCache(true);
    try {
      const response = await axios.post('http://localhost:3000/graphql', {
        query: `
          query {
            noCache
          }
        `,
      });
      setDataNoCache(response.data.data.noCache);
    } catch (err) {
      setError('Error fetching no cache data');
    } finally {
      setLoadingNoCache(false);
    }
  };

  const fetchDataCache = async () => {
    setLoadingCache(true);
    try {
      const response = await axios.post('http://localhost:3000/graphql', {
        query: `
          query {
            cache
          }
        `,
      });
      setDataCache(response.data.data.cache);
    } catch (err) {
      setError('Error fetching cache data');
    } finally {
      setLoadingCache(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.post('http://localhost:3000/graphql', {
        query: `
          query {
            performance {
              noCacheTime
              cacheTime
            }
          }
        `,
      });
      setPerformanceData(response.data.data.performance);
    } catch (err) {
      setError('Error fetching performance data');
    }
  };

  const calculateFrontEndCacheTime = () => {
    const start = performance.now();
    // Предполагаем, что кэширование происходит здесь (например, сохраняем данные в состоянии)
    const end = performance.now();
    return end - start; // Возвращаем время кэширования
  };

  useEffect(() => {
    fetchDataNoCache();
    fetchDataCache();
    fetchPerformanceData();
  }, []);

  const frontEndCacheTime = calculateFrontEndCacheTime();

  return (
    <div className="container">
      <h1>Data Comparison</h1>

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', width: '100%' }}>
        <section className="data-section">
          <h2>Data without Cache (Backend)</h2>
          {loadingNoCache ? <p>Loading...</p> : <pre>{dataNoCache}</pre>}
          {performanceData.noCacheTime && (
            <p className="time-info">Time taken (backend no cache): {performanceData.noCacheTime.toFixed(2)} ms</p>
          )}
        </section>

        <section className="data-section">
          <h2>Data with Cache (Frontend)</h2>
          <pre>{dataNoCache}</pre>
          <p className="time-info">Time taken (cached on frontend): {frontEndCacheTime.toFixed(2)} ms</p>
        </section>

        <section className="data-section">
          <h2>Data with Cache (Backend)</h2>
          {loadingCache ? <p>Loading...</p> : <pre>{dataCache}</pre>}
          {performanceData.cacheTime && (
            <p className="time-info">Time taken (backend cache): {performanceData.cacheTime.toFixed(2)} ms</p>
          )}
        </section>

        <section className="data-section">
          <h2>Performance Data</h2>
          <p>Time without cache (backend): {performanceData.noCacheTime ? performanceData.noCacheTime.toFixed(2) : 'N/A'} ms</p>
          <p>Time with cache (backend): {performanceData.cacheTime ? performanceData.cacheTime.toFixed(2) : 'N/A'} ms</p>
          <p>Time with cache (frontend): {frontEndCacheTime.toFixed(2)} ms</p>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;
