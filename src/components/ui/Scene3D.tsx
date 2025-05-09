
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Scene3DProps {
  className?: string;
}

const Scene3D: React.FC<Scene3DProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGLSupport, setHasWebGLSupport] = useState(true);
  
  // Check for WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const isWebGLSupported = !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
    
    setHasWebGLSupport(isWebGLSupported);
  }, []);
  
  useEffect(() => {
    // Don't attempt to initialize Three.js if WebGL is not supported
    if (!hasWebGLSupport || !mountRef.current) return;
    
    let renderer: THREE.WebGLRenderer | null = null;
    
    try {
      // Basic Three.js setup
      const width = mountRef.current.clientWidth || 300;
      const height = mountRef.current.clientHeight || 300;
      
      // Scene, camera, renderer
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      
      // Try to create the renderer with a catch for errors
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        canvas: document.createElement('canvas'),
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(width, height);
      
      mountRef.current.appendChild(renderer.domElement);
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);
      
      // Create a luxury house-like shape (simplified)
      const createHouse = () => {
        const group = new THREE.Group();
        
        // Main house cube
        const houseGeometry = new THREE.BoxGeometry(2, 1, 2);
        const houseMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xffffff,
          flatShading: true 
        });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        house.position.y = 0.5;
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xD4AF37, // Gold color
          flatShading: true 
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.5;
        roof.rotation.y = Math.PI / 4;
        
        // Windows
        const windowGeometry = new THREE.PlaneGeometry(0.4, 0.4);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x88ccff, 
          side: THREE.DoubleSide,
          flatShading: true 
        });
        
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(1.01, 0.5, 0.3);
        window1.rotation.y = Math.PI / 2;
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(1.01, 0.5, -0.3);
        window2.rotation.y = Math.PI / 2;
        
        const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
        window3.position.set(-1.01, 0.5, 0.3);
        window3.rotation.y = -Math.PI / 2;
        
        const window4 = new THREE.Mesh(windowGeometry, windowMaterial);
        window4.position.set(-1.01, 0.5, -0.3);
        window4.rotation.y = -Math.PI / 2;
        
        // Door
        const doorGeometry = new THREE.PlaneGeometry(0.4, 0.8);
        const doorMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x8B4513,
          side: THREE.DoubleSide,
          flatShading: true 
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0.4, 1.01);
        
        // Ground
        const groundGeometry = new THREE.CircleGeometry(3, 32);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x7CFC00,
          side: THREE.DoubleSide,
          flatShading: true 
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        
        // Add all elements to the group
        group.add(house, roof, window1, window2, window3, window4, door, ground);
        
        return group;
      };
      
      const houseModel = createHouse();
      scene.add(houseModel);
      
      // Add controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer?.render(scene, camera);
      };
      
      animate();
      
      // Handle window resize
      const handleResize = () => {
        if (!mountRef.current || !renderer) return;
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer) {
          try {
            mountRef.current.removeChild(renderer.domElement);
          } catch (e) {
            console.log('Error during cleanup:', e);
          }
        }
        scene.clear();
      };
    } catch (error) {
      console.error('Error initializing WebGL scene:', error);
      setHasWebGLSupport(false);
      return () => {};
    }
  }, [hasWebGLSupport]);
  
  if (!hasWebGLSupport) {
    return (
      <div className={`w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-6">
          <h3 className="text-xl font-semibold text-navy mb-2">3D Preview Not Available</h3>
          <p className="text-gray-600">
            Your device or browser doesn't support WebGL, which is required for 3D visualization.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Try using a modern browser like Chrome, Firefox, or Edge.
          </p>
        </div>
      </div>
    );
  }
  
  return <div ref={mountRef} className={`w-full h-full min-h-[300px] ${className}`} />;
};

export default Scene3D;
