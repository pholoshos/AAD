import * as THREE from 'three';

export class CuttingGizmo {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.gizmo = new THREE.Group();
    this.isVisible = false;
    this.isDragging = false;
    this.targetObject = null;
    this.cuttingPlane = null;
    this.planeHelper = null;
    
    // Mouse and raycaster for interaction
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    
    this.createCuttingGizmo();
    this.setupEventListeners();
  }
  
  createCuttingGizmo() {
    // Create a cutting plane visualization
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6b35, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    this.cuttingPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.cuttingPlane.userData = { type: 'cuttingPlane' };
    
    // Create plane outline
    const edges = new THREE.EdgesGeometry(planeGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff6b35, linewidth: 2 });
    this.planeHelper = new THREE.LineSegments(edges, lineMaterial);
    
    // Create control handles for plane manipulation
    this.createControlHandles();
    
    this.gizmo.add(this.cuttingPlane);
    this.gizmo.add(this.planeHelper);
    
    this.hide();
  }
  
  createControlHandles() {
    // Create handles for rotating and moving the cutting plane
    const handleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    // Corner handles
    const positions = [
      [-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]
    ];
    
    positions.forEach((pos, index) => {
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.position.set(pos[0], pos[1], pos[2]);
      handle.userData = { type: 'handle', index };
      this.gizmo.add(handle);
    });
  }
  
  setupEventListeners() {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp);
  }
  
  onMouseDown(event) {
    if (!this.isVisible) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.gizmo, true);
    
    if (intersects.length > 0) {
      event.stopPropagation();
      this.isDragging = true;
      this.selectedHandle = intersects[0].object.userData;
    }
  }
  
  onMouseMove(event) {
    if (!this.isDragging) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update cutting plane position/rotation based on mouse movement
    // This is a simplified implementation
    if (this.selectedHandle && this.selectedHandle.type === 'cuttingPlane') {
      // Move the entire plane
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersectPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), intersectPoint);
      
      if (intersectPoint && this.targetObject) {
        this.gizmo.position.copy(intersectPoint);
      }
    }
  }
  
  onMouseUp(event) {
    this.isDragging = false;
    this.selectedHandle = null;
  }
  
  attachToObject(object) {
    this.targetObject = object;
    if (object) {
      // Position the cutting plane at the object's center
      this.gizmo.position.copy(object.position);
      this.show();
    } else {
      this.hide();
    }
  }
  
  show() {
    this.isVisible = true;
    this.gizmo.visible = true;
  }
  
  hide() {
    this.isVisible = false;
    this.gizmo.visible = false;
  }
  
  updateSize() {
    if (!this.targetObject) return;
    
    const distance = this.camera.position.distanceTo(this.gizmo.position);
    const scale = distance * 0.1;
    this.gizmo.scale.setScalar(scale);
  }
  
  performCut() {
    if (!this.targetObject || !this.cuttingPlane) {
      console.warn('No target object or cutting plane available for cut operation');
      return;
    }
    
    // This is where you would implement the actual cutting logic
    // For now, this is a placeholder that logs the operation
    console.log('Performing cut operation on:', this.targetObject);
    console.log('Cutting plane position:', this.cuttingPlane.position);
    console.log('Cutting plane rotation:', this.cuttingPlane.rotation);
    
    // In a real implementation, you would:
    // 1. Create a THREE.Plane from the cutting plane position/rotation
    // 2. Use CSG (Constructive Solid Geometry) operations to split the geometry
    // 3. Create new mesh objects from the split geometry
    // 4. Add the new objects to the scene and remove the original
  }
  
  dispose() {
    this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
    this.renderer.domElement.removeEventListener('mouseup', this.onMouseUp);
  }
}