import * as THREE from 'three';

/**
 * Initialize Three.js scene with camera, renderer, and basic lighting
 * @param {HTMLElement} container - DOM element to attach renderer
 * @returns {Object} Scene setup objects
 */
export function initializeThreeJS(container) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);
  
  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  // Remove shadow mapping since we're not using lighting
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  
  // Remove all lighting setup
  // const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  // scene.add(ambientLight);
  
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  // directionalLight.position.set(10, 10, 5);
  // directionalLight.castShadow = true;
  // directionalLight.shadow.mapSize.width = 2048;
  // directionalLight.shadow.mapSize.height = 2048;
  // scene.add(directionalLight);
  
  // Grid helper
  const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
  scene.add(gridHelper);
  
  // Axes helper
  const axesHelper = new THREE.AxesHelper(2);
  scene.add(axesHelper);
  
  return {
    scene,
    camera,
    renderer,
    gridHelper,
    axesHelper
  };
}

/**
 * Create Three.js geometry based on object type and parameters
 * @param {string} type - Object type
 * @param {Object} geometry - Geometry parameters
 * @returns {THREE.BufferGeometry} Three.js geometry
 */
export function createGeometry(type, geometry) {
  switch (type) {
    case 'cube':
      return new THREE.BoxGeometry(
        geometry.width || 1,
        geometry.height || 1,
        geometry.depth || 1
      );
    case 'sphere':
      return new THREE.SphereGeometry(
        geometry.radius || 0.5,
        geometry.widthSegments || 32,
        geometry.heightSegments || 16
      );
    case 'cylinder':
      return new THREE.CylinderGeometry(
        geometry.radiusTop || 0.5,
        geometry.radiusBottom || 0.5,
        geometry.height || 1,
        geometry.radialSegments || 32
      );
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

/**
 * Create Three.js material with given properties
 * @param {Object} materialProps - Material properties
 * @param {boolean} selected - Whether object is selected
 * @returns {THREE.Material} Three.js material
 */
export function createMaterial(materialProps, selected = false) {
  // Use MeshBasicMaterial instead of MeshLambertMaterial for unlit rendering
  const material = new THREE.MeshBasicMaterial({
    color: selected ? 0xff6b35 : materialProps.color || 0x3b82f6,
    transparent: false
  });
  
  // Remove emissive property since MeshBasicMaterial doesn't support it
  // if (selected) {
  //   material.emissive = new THREE.Color(0x333333);
  // }
  
  return material;
}