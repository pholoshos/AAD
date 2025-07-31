import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

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
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  
  // Post-processing setup for outlines
  const composer = new EffectComposer(renderer);
  
  // Render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  // Outline pass
  const outlinePass = new OutlinePass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    scene,
    camera
  );
  
  // Configure outline appearance
  outlinePass.edgeStrength = 3.0;
  outlinePass.edgeGlow = 0.0;
  outlinePass.edgeThickness = 1.0;
  outlinePass.pulsePeriod = 0;
  outlinePass.visibleEdgeColor.set('#ffffff');
  outlinePass.hiddenEdgeColor.set('#190a05');
  
  composer.addPass(outlinePass);
  
  // Output pass for gamma correction
  const outputPass = new OutputPass();
  composer.addPass(outputPass);
  
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
    composer,
    outlinePass,
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
    // New curved shapes
    case 'torus':
      return new THREE.TorusGeometry(
        geometry.radius || 0.5,
        geometry.tube || 0.2,
        geometry.radialSegments || 16,
        geometry.tubularSegments || 100
      );
    case 'cone':
      return new THREE.ConeGeometry(
        geometry.radius || 0.5,
        geometry.height || 1,
        geometry.radialSegments || 32
      );
    case 'torusKnot':
      return new THREE.TorusKnotGeometry(
        geometry.radius || 0.5,
        geometry.tube || 0.15,
        geometry.tubularSegments || 100,
        geometry.radialSegments || 16,
        geometry.p || 2,
        geometry.q || 3
      );
    case 'ring':
      return new THREE.RingGeometry(
        geometry.innerRadius || 0.2,
        geometry.outerRadius || 0.5,
        geometry.thetaSegments || 32
      );
    case 'dodecahedron':
      return new THREE.DodecahedronGeometry(
        geometry.radius || 0.5,
        geometry.detail || 0
      );
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(
        geometry.radius || 0.5,
        geometry.detail || 0
      );
    case 'octahedron':
      return new THREE.OctahedronGeometry(
        geometry.radius || 0.5,
        geometry.detail || 0
      );
    case 'tetrahedron':
      return new THREE.TetrahedronGeometry(
        geometry.radius || 0.5,
        geometry.detail || 0
      );
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

/**
 * Create wireframe edge geometry for showing model structure
 * @param {THREE.BufferGeometry} geometry - Source geometry
 * @returns {THREE.BufferGeometry} Edge geometry
 */
export function createEdgeGeometry(geometry) {
  const edges = new THREE.EdgesGeometry(geometry);
  return edges;
}

/**
 * Create Three.js material with wireframe/outline styling
 * @param {Object} materialProps - Material properties
 * @param {boolean} selected - Whether object is selected
 * @param {boolean} wireframeMode - Whether to show wireframe
 * @returns {THREE.Material|Object} Three.js material(s)
 */
export function createMaterial(materialProps, selected = false, wireframeMode = true) {
  if (wireframeMode) {
    // Create both solid and wireframe materials for layered rendering
    const solidMaterial = new THREE.MeshBasicMaterial({
      color: selected ? 0xff6b35 : materialProps.color || 0x3b82f6,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: selected ? 0xff0000 : 0x000000,
      linewidth: selected ? 2 : 1,
      transparent: false
    });
    
    return { solid: solidMaterial, wireframe: wireframeMaterial };
  } else {
    // Standard material for non-wireframe mode
    return new THREE.MeshBasicMaterial({
      color: selected ? 0xff6b35 : materialProps.color || 0x3b82f6,
      transparent: false
    });
  }
}

/**
 * Create a mesh with wireframe overlay
 * @param {THREE.BufferGeometry} geometry - Geometry
 * @param {Object} materialProps - Material properties
 * @param {boolean} selected - Whether selected
 * @returns {THREE.Group} Group containing solid mesh and wireframe
 */
export function createWireframeMesh(geometry, materialProps, selected = false) {
  const group = new THREE.Group();
  
  // Create materials
  const materials = createMaterial(materialProps, selected, true);
  
  // Solid mesh with transparency
  const solidMesh = new THREE.Mesh(geometry, materials.solid);
  group.add(solidMesh);
  
  // Wireframe overlay
  const edgeGeometry = createEdgeGeometry(geometry);
  const wireframeMesh = new THREE.LineSegments(edgeGeometry, materials.wireframe);
  group.add(wireframeMesh);
  
  // Store references for easy access
  group.userData.solidMesh = solidMesh;
  group.userData.wireframeMesh = wireframeMesh;
  
  return group;
}