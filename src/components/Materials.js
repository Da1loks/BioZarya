import React from 'react';
import './Materials.css';

const Materials = () => {
  const materials = [
    {
      id: 1,
      title: 'Анатомия опорно-двигательного аппарата',
      description: 'Учебные материалы по анатомии скелета и мышечной системы человека',
      level: 'Начальный'
    },
    {
      id: 2,
      title: 'Сердечно-сосудистая система',
      description: 'Подробное изучение структуры и функции сердца и сосудов',
      level: 'Средний'
    },
    {
      id: 3,
      title: 'Нервная система',
      description: 'Головной и спинной мозг, нервы и их функции в организме',
      level: 'Продвинутый'
    },
    {
      id: 4,
      title: 'Дыхательная система',
      description: 'Анатомия дыхательных путей и легких, механизмы газообмена',
      level: 'Средний'
    },
    {
      id: 5,
      title: 'Пищеварительная система',
      description: 'Строение органов пищеварения и процессы переработки пищи',
      level: 'Начальный'
    },
    {
      id: 6,
      title: 'Эндокринная система',
      description: 'Железы внутренней секреции и гормональная регуляция',
      level: 'Продвинутый'
    }
  ];

  return (
    <div className="materials-container">
      <h1 className="materials-title">Учебные материалы</h1>
      <p className="materials-subtitle">Изучайте анатомию человека с помощью наших интерактивных материалов</p>
      
      <div className="materials-grid">
        {materials.map(material => (
          <div className="material-card" key={material.id}>
            <div className="material-header">
              <span className="material-level">{material.level}</span>
            </div>
            <div className="material-content">
              <h3>{material.title}</h3>
              <p>{material.description}</p>
              <button className="material-button">Начать обучение</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Materials; 