import { useState, useEffect, useRef } from 'react';
import './App.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Bones from './pages/Bones';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const searchInputRef = useRef(null);
  const skullContainerRef = useRef(null);
  const skullModelRef = useRef(null);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    checkIfMobile(); 
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  useEffect(() => {
    if (isMobileView || !skullContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    skullContainerRef.current.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    // Добавим точечный свет для лучшего отображения деталей
    const pointLight = new THREE.PointLight(0xffffff, 0.4, 100);
    pointLight.position.set(-5, 0, 2);
    scene.add(pointLight);
    
    // Добавим мягкий свет снизу для подсветки черепа
    const bottomLight = new THREE.PointLight(0xaaaaff, 0.1, 50);
    bottomLight.position.set(2, -5, 2);
    scene.add(bottomLight);
    
    camera.position.z = 5;
    
    let currentScale = 1.1;
    
    const calculateScale = () => {
      let baseScale = 1.1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 1024) {
        baseScale = 1.0;
      } else if (width >= 1920) {
        baseScale = 1.2;
      }
      
      if (height < 600) {
        baseScale *= 0.9;
      } else if (height > 1200) {
        baseScale *= 1.1;
      }
      
      return baseScale;
    };
    
    currentScale = calculateScale();
    
    // Создаем простую геометрию в качестве заглушки
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xeeeeee,
      roughness: 0.65,
      metalness: 0.2,
      emissive: 0x000000,
      emissiveIntensity: 0
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(2, 0, 0);
    scene.add(sphere);
    
    // Пытаемся загрузить модель
    const loader = new GLTFLoader();
    const modelPath = '/models/skull.glb';
    
    loader.load(
      modelPath,
      (gltf) => {
        if (skullModelRef.current) {
          scene.remove(skullModelRef.current);
        }
        // Удаляем заглушку
        scene.remove(sphere);
        
        const skull = gltf.scene;
        skull.scale.set(currentScale, currentScale, currentScale);
        const xOffset = window.innerWidth > 768 ? 2.5 : 1;
        skull.position.set(xOffset, 0, 0);
        skull.rotation.y = (2 * Math.PI) / 3;
        skull.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.color = new THREE.Color(0xeeeeee);
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
            child.material.metalness = 0.2;
            child.material.roughness = 0.65;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(skull);
        skullModelRef.current = skull;
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% загружено');
      },
      (error) => {
        console.error('Ошибка загрузки модели:', error);
        // Оставляем сферу как заглушку
        skullModelRef.current = sphere;
      }
    );
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    
    const baseRotationY = (2 * Math.PI) / 3;
    let rotationAngle = 0;
    let currentRotationY = baseRotationY;
    let currentRotationX = 0;
    let targetRotationY = baseRotationY;
    let targetRotationX = 0;
    
    const smoothFactor = 0.03;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (skullModelRef.current) {
        rotationAngle += 0.0005;
        
        targetRotationY = baseRotationY + Math.sin(rotationAngle) * 0.6;
        targetRotationX = Math.sin(rotationAngle * 0.5) * 0.3;
        
        currentRotationY += (targetRotationY - currentRotationY) * smoothFactor;
        currentRotationX += (targetRotationX - currentRotationX) * smoothFactor;
        
        skullModelRef.current.rotation.y = currentRotationY;
        skullModelRef.current.rotation.x = currentRotationX;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        if (skullContainerRef.current) {
          skullContainerRef.current.removeChild(renderer.domElement);
        }
        return;
      }
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      currentScale = calculateScale();
      
      if (skullModelRef.current) {
        skullModelRef.current.scale.set(currentScale, currentScale, currentScale);
        const xOffset = window.innerWidth > 768 ? 2 : 1;
        skullModelRef.current.position.x = xOffset;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (skullContainerRef.current) {
        skullContainerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [isMobileView]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isMobileView && e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileView]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Поиск по запросу:', searchQuery);
  };

  return (
    <HashRouter>
      <div className="App">
        <header className="header">
          <nav className="navigation">
            <Link to="/" className="logo">BioZarya</Link>
            {!isMobileView && (
              <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    className="search-input" 
                    placeholder="Поиск..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="search-shortcut">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span className="keyboard-shortcut">Ctrl K</span>
                  </div>
                </form>
              </div>
            )}
          </nav>
        </header>
        {!isMobileView && (
          <div className="skull-flex-row">
            <div className="skull-side-text">Биозаря анатомия</div>
            <div className="skull-background" ref={skullContainerRef}></div>
          </div>
        )}
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="home-container">
                <div className="welcome-section">
                  <h1>Добро пожаловать на BioZarya</h1>
                  <p>Портал об анатомии человека</p>
                  <div className="sections-grid">
                    <Link to="/bones" className="section-card">
                      <h3>Кости человека</h3>
                      <p>Изучайте строение, функции и заболевания костной системы</p>
                    </Link>
                    {/* Другие разделы будут добавлены позже */}
                  </div>
                </div>
              </div>
            } />
            <Route path="/bones" element={<Bones />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="footer-content">
            <p className="authors-info">Сайт выполнили: Абдреев Данис 8-4 и Захаркин Кирилл 8-4</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
