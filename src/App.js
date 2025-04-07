import { useState, useEffect } from 'react';
import './App.css';
import Materials from './components/Materials';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWarning, setShowWarning] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Примерные данные статей для поиска
  const articles = [
    { id: 1, title: 'Анатомия скелета человека', category: 'Опорно-двигательная система' },
    { id: 2, title: 'Мышечная система и её функции', category: 'Опорно-двигательная система' },
    { id: 3, title: 'Строение сердца и его работа', category: 'Сердечно-сосудистая система' },
    { id: 4, title: 'Кровеносные сосуды и кровообращение', category: 'Сердечно-сосудистая система' },
    { id: 5, title: 'Нервная система человека', category: 'Нервная система' },
    { id: 6, title: 'Головной мозг и его функции', category: 'Нервная система' },
    { id: 7, title: 'Дыхательная система и газообмен', category: 'Дыхательная система' },
    { id: 8, title: 'Органы дыхания и их строение', category: 'Дыхательная система' },
    { id: 9, title: 'Пищеварительная система человека', category: 'Пищеварительная система' },
    { id: 10, title: 'Эндокринная система и гормоны', category: 'Эндокринная система' },
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Простой алгоритм поиска по ключевым словам
    const results = articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setShowResults(true);
  };

  const closeResults = () => {
    setShowResults(false);
  };

  return (
    <div className="App">
      {showWarning && (
        <div className="dev-warning-overlay">
          <div className="dev-warning">
            <p>Внимание! Сайт находится в стадии активной разработки. Некоторые функции могут работать некорректно.</p>
            <p>Недоступный функционал: статьи не реализованы, переход на страницы материалов не работает.</p>
            <button onClick={() => setShowWarning(false)}>Понятно</button>
          </div>
        </div>
      )}

      {showResults && (
        <div className="search-results-overlay">
          <div className="search-results-container">
            <div className="search-results-header">
              <h2>Результаты поиска: "{searchQuery}"</h2>
              <button className="close-results-btn" onClick={closeResults}>×</button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="search-results-grid">
                {searchResults.map(article => (
                  <div className="search-result-card" key={article.id}>
                    <span className="result-category">{article.category}</span>
                    <h3>{article.title}</h3>
                    <button className="read-article-btn">Читать статью</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>По вашему запросу ничего не найдено. Попробуйте другие ключевые слова.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="model-3d-container">
        <div 
          className="model-3d" 
          style={{ 
            transform: `translateX(${mousePosition.x * 30}px) translateY(${mousePosition.y * 30}px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`
          }}
        ></div>
      </div>

      <header className="header">
        <nav className="navigation">
          <div className="logo">БиоЗаря</div>
          
          <div className="search-container">
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Поиск по сайту..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
          </div>
          
          <ul className="nav-links">
            <li><a href="#materials">Материалы</a></li>
          </ul>
        </nav>
      </header>
      
      <main className="main">
        <section className="hero">
          <h1>Изучение анатомии человека</h1>
          <p>Погрузитесь в увлекательный мир строения человеческого тела</p>
          <a href="#materials" className="cta-button">Начать изучение</a>
        </section>
        
        <section id="materials" className="materials-section">
          <Materials />
        </section>
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-divider"></div>
          <p className="footer-credit">сайт сделан <a href="https://t.me/abdreevdanis" target="_blank" rel="noopener noreferrer">@abdreevdanis</a></p>
          <p className="footer-license">Лицензия отсутствует</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
