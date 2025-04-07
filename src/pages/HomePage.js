import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  return (
    <>
      <div className="model-3d-container">
        <div 
          className="model-3d" 
          style={{ 
            transform: `translateX(${mousePosition.x * 30}px) translateY(${mousePosition.y * 30}px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`
          }}
        ></div>
      </div>

      <main className="main">
        <section className="hero">
          <h1>Изучение анатомии человека</h1>
          <p>Погрузитесь в увлекательный мир строения человеческого тела</p>
          <Link to="/materials" className="cta-button">Начать изучение</Link>
        </section>
      </main>
    </>
  );
};

export default HomePage; 