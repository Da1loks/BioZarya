import React, { useEffect, useRef } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CardMedia, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Создаем темную тему для Material UI
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#747bff',
    },
    background: {
      default: '#000000',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Unbounded", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.8rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h6: {
      fontSize: '1.2rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
  },
});

const Bones = () => {
  const skeletonModelRef = useRef(null);

  useEffect(() => {
    if (skeletonModelRef.current) {
      // Создаем Three.js сцену
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      // Переменная для хранения ссылки на модель черепа
      let skullModel = null;

      // Настраиваем камеру
      const camera = new THREE.PerspectiveCamera(75, skeletonModelRef.current.clientWidth / skeletonModelRef.current.clientHeight, 0.1, 1000);
      camera.position.z = 5;

      // Настраиваем рендерер
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(skeletonModelRef.current.clientWidth, skeletonModelRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      skeletonModelRef.current.appendChild(renderer.domElement);

      // Добавляем освещение
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      scene.add(directionalLight);
      
      // Добавляем дополнительное освещение для лучшей видимости деталей
      const frontLight = new THREE.DirectionalLight(0xffffff, 0.5);
      frontLight.position.set(0, 0, 5);
      scene.add(frontLight);
      
      const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
      backLight.position.set(0, 0, -5);
      scene.add(backLight);

      // Создаем простую геометрию как заглушку
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0xeeeeee,
        roughness: 0.65,
        metalness: 0.2,
        emissive: 0x000000,
        emissiveIntensity: 0
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // Управление орбитой для вращения модели
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Попытка загрузить модель скелета
      try {
        const loader = new GLTFLoader();
        loader.load('/models/skull.glb', (gltf) => {
          const model = gltf.scene;
          model.scale.set(2, 2, 2);
          scene.add(model);
          scene.remove(cube); // Удаляем заглушку если модель загрузилась

          // Центрировать модель
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.x = -center.x;
          model.position.y = -center.y;
          model.position.z = -center.z;
          
          // Начальное положение и вращение
          model.rotation.x = 0.1;
          model.rotation.y = -0.3;
          
          // Сохраняем ссылку на модель для анимации
          skullModel = model;

          // Настраиваем материалы для темной темы
          model.traverse((child) => {
            if (child.isMesh) {
              child.material.color = new THREE.Color(0xeeeeee);
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0;
              child.material.metalness = 0.2;
              child.material.roughness = 0.65;
            }
          });
        }, undefined, (error) => {
          console.error('Ошибка загрузки модели:', error);
          // Модель не загружена, оставляем куб как заглушку
        });
      } catch (error) {
        console.error('Ошибка при попытке загрузить модель:', error);
        // В случае ошибки используем куб как заглушку
      }

      // Анимация
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Вращаем куб как заглушку
        if (cube) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        }
        
        // Плавное вращение модели черепа
        if (skullModel) {
          skullModel.rotation.y += 0.002;
        }
        
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Обработка изменения размера окна
      const handleResize = () => {
        if (skeletonModelRef.current) {
          camera.aspect = skeletonModelRef.current.clientWidth / skeletonModelRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(skeletonModelRef.current.clientWidth, skeletonModelRef.current.clientHeight);
          renderer.setPixelRatio(window.devicePixelRatio);
        }
      };
      window.addEventListener('resize', handleResize);

      // Очистка при размонтировании компонента
      return () => {
        window.removeEventListener('resize', handleResize);
        if (skeletonModelRef.current && renderer.domElement) {
          skeletonModelRef.current.removeChild(renderer.domElement);
        }
      };
    }
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="lg" sx={{ py: 4, mt: 2, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Костная система человека
        </Typography>
        
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Интерактивная 3D-модель черепа
          </Typography>
          <Box 
            ref={skeletonModelRef}
            sx={{ 
              width: '100%', 
              height: 500, 
              bgcolor: 'background.default',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
            Используйте мышь для вращения модели. Прокрутите колесо мыши для увеличения/уменьшения.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Строение черепа человека
          </Typography>
          <Typography variant="body1" paragraph>
            Череп человека — это костная структура, которая защищает головной мозг, поддерживает структуры лица и формирует полости для особых органов чувств. Череп состоит из 22 костей: 8 костей образуют мозговой череп (нейрокраниум) и 14 костей формируют лицевой череп (висцерокраниум).
          </Typography>
          <Typography variant="body1" paragraph>
            Кости черепа соединены между собой неподвижными соединениями — швами, за исключением подвижного соединения нижней челюсти с височной костью (височно-нижнечелюстной сустав).
          </Typography>
        </Box>
        
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Что такое кости?
          </Typography>
          <Typography variant="body1" paragraph>
            Кости — это жесткие органы, образующие часть эндоскелета позвоночных. Они поддерживают и защищают различные органы тела, производят красные и белые кровяные тельца, хранят минералы, обеспечивают структуру и поддержку организму, а также делают возможным движение.
          </Typography>
          <Typography variant="body1" paragraph>
            Взрослый человеческий скелет состоит из 206 костей, не считая зубы и хрящи. Кости соединяются между собой с помощью суставов, которые позволяют скелету двигаться.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Строение скелета человека
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <Box
                  sx={{ 
                    height: 300, 
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    border: '1px dashed rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <img 
                    src="/images/systems/vertebra.png" 
                    alt="Скелет человека" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<Typography variant="body1" color="text.secondary">Изображение скелета</Typography>';
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6">Скелет человека</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Полный скелет взрослого человека состоит из 206 костей, соединенных между собой различными типами суставов.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <Box
                  sx={{ 
                    height: 300, 
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src="/images/bones/stroenie-kostei-cheloveka.jpg" 
                    alt="Строение кости человека" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} 
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6">Строение кости</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Кость состоит из компактного и губчатого вещества, покрытого надкостницей и заполненного костным мозгом.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Основные функции костей
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>•</ListItemIcon>
                    <ListItemText primary="Опорная — образуют твердый каркас тела" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>•</ListItemIcon>
                    <ListItemText primary="Защитная — защищают внутренние органы" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>•</ListItemIcon>
                    <ListItemText primary="Кроветворная — в красном костном мозге происходит кроветворение" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>•</ListItemIcon>
                    <ListItemText primary="Депо минералов — хранение кальция, фосфора и других минералов" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>•</ListItemIcon>
                    <ListItemText primary="Двигательная — служат рычагами при движениях тела" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Строение кости
                </Typography>
                <Typography variant="body1" paragraph>
                  Внешне кость покрыта надкостницей — тонкой соединительнотканной оболочкой, содержащей нервы и кровеносные сосуды.
                </Typography>
                <Typography variant="body1" paragraph>
                  Под надкостницей находится компактное вещество кости, образующее внешний слой. Внутри располагается губчатое вещество, заполненное костным мозгом.
                </Typography>
                <Typography variant="body1">
                  В составе кости выделяют органические вещества (коллаген) и неорганические компоненты (кальций, фосфор).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Классификация костей
          </Typography>
          <Typography variant="body1" paragraph>
            По форме и строению кости делятся на несколько типов:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Трубчатые
                  </Typography>
                  <Typography variant="body2">
                    Например, плечевая, бедренная, фаланги пальцев. Имеют полость, заполненную костным мозгом.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Плоские
                  </Typography>
                  <Typography variant="body2">
                    Например, кости черепа, лопатки, грудина. Защищают внутренние органы.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Губчатые
                  </Typography>
                  <Typography variant="body2">
                    Например, позвонки, кости запястья. Имеют ячеистое строение.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Смешанные
                  </Typography>
                  <Typography variant="body2">
                    Например, основание черепа, ребра. Сочетают свойства разных типов костей.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Классификация костей черепа
          </Typography>
          <Typography variant="body1" paragraph>
            Кости черепа делятся на две основные группы:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', overflow: 'visible' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Кости мозгового черепа
                  </Typography>
                  <Typography variant="body2">
                    Защищают головной мозг и образуют полость черепа. Включают:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    <Box component="li" sx={{ mb: 0.5 }}>Лобную кость</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Теменные кости (2)</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Височные кости (2)</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Затылочную кость</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Клиновидную кость</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Решетчатую кость</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', overflow: 'visible' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Кости лицевого черепа
                  </Typography>
                  <Typography variant="body2">
                    Формируют остов лица и поддерживают органы чувств. Включают:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    <Box component="li" sx={{ mb: 0.5 }}>Верхнечелюстные кости (2)</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Нижнюю челюсть</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Носовые кости (2)</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Скуловые кости (2)</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>Небные кости (2)</Box>
                    <Box component="li" sx={{ mb: 0.5 }}>И другие мелкие кости</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Правильное питание для здоровья костей
          </Typography>
          <Typography variant="body1" paragraph>
            Для поддержания здоровья костей необходимо сбалансированное питание, богатое следующими элементами:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Необходимые микроэлементы
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText 
                        primary="Кальций" 
                        secondary="Необходим для формирования костной ткани. Источники: молочные продукты, сардины, миндаль, брокколи." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText 
                        primary="Фосфор" 
                        secondary="Работает вместе с кальцием. Источники: мясо, рыба, орехи, бобовые." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText 
                        primary="Магний" 
                        secondary="Участвует в метаболизме кальция. Источники: орехи, семена, цельнозерновые продукты." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText 
                        primary="Витамин D" 
                        secondary="Необходим для усвоения кальция. Источники: жирная рыба, яичные желтки, воздействие солнечного света." 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Рекомендации по питанию
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText primary="Регулярно потребляйте молочные продукты или их растительные альтернативы, обогащенные кальцием" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText primary="Включайте в рацион больше свежих овощей, особенно листовой зелени" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText primary="Употребляйте достаточное количество белка для поддержания костной массы" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText primary="Ограничьте потребление кофе и алкоголя, которые могут снижать усвоение кальция" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>•</ListItemIcon>
                      <ListItemText primary="Следите за адекватным потреблением витамина K (зеленые листовые овощи)" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Заболевания костей и их профилактика
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Остеопороз
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Характеризуется снижением плотности костной ткани, что делает кости хрупкими и подверженными переломам.
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Профилактика:
                  </Typography>
                  <Typography variant="body2">
                    • Достаточное потребление кальция и витамина D<br/>
                    • Регулярные физические упражнения<br/>
                    • Отказ от курения и чрезмерного употребления алкоголя
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Рахит
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Заболевание, вызванное недостатком витамина D, приводит к размягчению и деформации костей у детей.
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Профилактика:
                  </Typography>
                  <Typography variant="body2">
                    • Достаточное пребывание на солнце<br/>
                    • Прием витамина D<br/>
                    • Сбалансированное питание
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Остеоартроз
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Дегенеративное заболевание суставов, при котором происходит разрушение хряща и изменение костной ткани.
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Профилактика:
                  </Typography>
                  <Typography variant="body2">
                    • Контроль веса<br/>
                    • Регулярная умеренная физическая активность<br/>
                    • Избегание чрезмерных нагрузок на суставы
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h4" component="h2" gutterBottom>
            Физическая активность и здоровье костей
          </Typography>
          <Typography variant="body1" paragraph>
            Регулярная физическая активность имеет решающее значение для здоровья костей. Упражнения с нагрузкой стимулируют образование новой костной ткани и укрепляют существующую.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Рекомендуемые виды физической активности:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Силовые тренировки
                  </Typography>
                  <Typography variant="body2">
                    Упражнения с отягощениями, работа с собственным весом, тренажеры — все это помогает укрепить кости и мышцы.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Аэробные нагрузки с весом
                  </Typography>
                  <Typography variant="body2">
                    Ходьба, бег, прыжки, танцы — упражнения, при которых тело преодолевает силу тяжести.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Упражнения на равновесие
                  </Typography>
                  <Typography variant="body2">
                    Тай-чи, йога, пилатес — помогают улучшить координацию и предотвратить падения, особенно важно в пожилом возрасте.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Bones; 