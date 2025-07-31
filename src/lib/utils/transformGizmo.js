import * as THREE from 'three';

export class TransformGizmo {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.gizmo = new THREE.Group();
    this.mode = 'translate'; // 'translate', 'rotate', 'scale'
    this.size = 1;
    this.isVisible = false;
    this.selectedAxis = null;
    this.isDragging = false;
    
    // Raycaster for interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.plane = new THREE.Plane();
    this.intersection = new THREE.Vector3();
    this.offset = new THREE.Vector3();
    this.startPosition = new THREE.Vector3();
    this.startRotation = new THREE.Euler();
    this.startScale = new THREE.Vector3();
    
    this.createGizmos();
    this.setupEventListeners();
  }
  
  createGizmos() {
    this.createTranslateGizmo();
    this.createRotateGizmo();
    this.createScaleGizmo();
    this.setMode('translate');
  }
  
  createTranslateGizmo() {
    this.translateGizmo = new THREE.Group();
    
    // Arrow geometry
    const arrowGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
    
    // X-axis (Red)
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xArrow = new THREE.Mesh(arrowGeometry, xMaterial);
    const xShaft = new THREE.Mesh(shaftGeometry, xMaterial);
    xArrow.position.set(1, 0, 0);
    xArrow.rotation.z = -Math.PI / 2;
    xShaft.position.set(0.5, 0, 0);
    xShaft.rotation.z = Math.PI / 2;
    xArrow.userData = { axis: 'x', type: 'translate' };
    xShaft.userData = { axis: 'x', type: 'translate' };
    
    // Y-axis (Green)
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yArrow = new THREE.Mesh(arrowGeometry, yMaterial);
    const yShaft = new THREE.Mesh(shaftGeometry, yMaterial);
    yArrow.position.set(0, 1, 0);
    yShaft.position.set(0, 0.5, 0);
    yArrow.userData = { axis: 'y', type: 'translate' };
    yShaft.userData = { axis: 'y', type: 'translate' };
    
    // Z-axis (Blue)
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zArrow = new THREE.Mesh(arrowGeometry, zMaterial);
    const zShaft = new THREE.Mesh(shaftGeometry, zMaterial);
    zArrow.position.set(0, 0, 1);
    zArrow.rotation.x = Math.PI / 2;
    zShaft.position.set(0, 0, 0.5);
    zShaft.rotation.x = Math.PI / 2;
    zArrow.userData = { axis: 'z', type: 'translate' };
    zShaft.userData = { axis: 'z', type: 'translate' };
    
    this.translateGizmo.add(xArrow, xShaft, yArrow, yShaft, zArrow, zShaft);
    this.gizmo.add(this.translateGizmo);
  }
  
  createRotateGizmo() {
    this.rotateGizmo = new THREE.Group();
    
    const torusGeometry = new THREE.TorusGeometry(1, 0.02, 8, 32);
    
    // X-axis rotation (Red)
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xTorus = new THREE.Mesh(torusGeometry, xMaterial);
    xTorus.rotation.y = Math.PI / 2;
    xTorus.userData = { axis: 'x', type: 'rotate' };
    
    // Y-axis rotation (Green)
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yTorus = new THREE.Mesh(torusGeometry, yMaterial);
    yTorus.rotation.x = Math.PI / 2;
    yTorus.userData = { axis: 'y', type: 'rotate' };
    
    // Z-axis rotation (Blue)
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zTorus = new THREE.Mesh(torusGeometry, zMaterial);
    zTorus.userData = { axis: 'z', type: 'rotate' };
    
    this.rotateGizmo.add(xTorus, yTorus, zTorus);
    this.gizmo.add(this.rotateGizmo);
  }
  
  createScaleGizmo() {
    this.scaleGizmo = new THREE.Group();
    
    const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
    
    // X-axis (Red)
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xCube = new THREE.Mesh(cubeGeometry, xMaterial);
    const xShaft = new THREE.Mesh(shaftGeometry, xMaterial);
    xCube.position.set(1, 0, 0);
    xShaft.position.set(0.5, 0, 0);
    xShaft.rotation.z = Math.PI / 2;
    xCube.userData = { axis: 'x', type: 'scale' };
    xShaft.userData = { axis: 'x', type: 'scale' };
    
    // Y-axis (Green)
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yCube = new THREE.Mesh(cubeGeometry, yMaterial);
    const yShaft = new THREE.Mesh(shaftGeometry, yMaterial);
    yCube.position.set(0, 1, 0);
    yShaft.position.set(0, 0.5, 0);
    yCube.userData = { axis: 'y', type: 'scale' };
    yShaft.userData = { axis: 'y', type: 'scale' };
    
    // Z-axis (Blue)
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zCube = new THREE.Mesh(cubeGeometry, zMaterial);
    const zShaft = new THREE.Mesh(shaftGeometry, zMaterial);
    zCube.position.set(0, 0, 1);
    zShaft.position.set(0, 0, 0.5);
    zShaft.rotation.x = Math.PI / 2;
    zCube.userData = { axis: 'z', type: 'scale' };
    zShaft.userData = { axis: 'z', type: 'scale' };
    
    // Uniform scale (Center)
    const uniformMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const uniformCube = new THREE.Mesh(cubeGeometry, uniformMaterial);
    uniformCube.userData = { axis: 'uniform', type: 'scale' };
    
    this.scaleGizmo.add(xCube, xShaft, yCube, yShaft, zCube, zShaft, uniformCube);
    this.gizmo.add(this.scaleGizmo);
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
      this.selectedAxis = intersects[0].object.userData.axis;
      this.isDragging = true;
      
      // Store initial values
      if (this.targetObject) {
        this.startPosition.copy(this.targetObject.position);
        this.startRotation.copy(this.targetObject.rotation);
        this.startScale.copy(this.targetObject.scale);
      }
      
      // Setup interaction plane
      this.setupInteractionPlane(this.selectedAxis);
      
      // Highlight selected axis
      this.highlightAxis(this.selectedAxis);
    }
  }
  
  onMouseMove(event) {
    if (!this.isDragging || !this.selectedAxis) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
      this.performTransform();
    }
  }
  
  onMouseUp(event) {
    if (this.isDragging) {
      this.isDragging = false;
      this.selectedAxis = null;
      this.unhighlightAll();
    }
  }
  
  setupInteractionPlane(axis) {
    const normal = new THREE.Vector3();
    
    switch (axis) {
      case 'x':
        normal.set(0, 1, 0);
        break;
      case 'y':
        normal.set(1, 0, 0);
        break;
      case 'z':
        normal.set(0, 1, 0);
        break;
      default:
        normal.set(0, 0, 1);
    }
    
    this.plane.setFromNormalAndCoplanarPoint(normal, this.gizmo.position);
  }
  
  performTransform() {
    if (!this.targetObject) return;
    
    const delta = this.intersection.clone().sub(this.gizmo.position);
    
    switch (this.mode) {
      case 'translate':
        this.performTranslation(delta);
        break;
      case 'rotate':
        this.performRotation(delta);
        break;
      case 'scale':
        this.performScaling(delta);
        break;
    }
    
    // Update gizmo position to follow object
    if (this.mode === 'translate') {
      this.gizmo.position.copy(this.targetObject.position);
    }
  }
  
  performTranslation(delta) {
    const movement = new THREE.Vector3();
    
    switch (this.selectedAxis) {
      case 'x':
        movement.x = delta.x;
        break;
      case 'y':
        movement.y = delta.y;
        break;
      case 'z':
        movement.z = delta.z;
        break;
    }
    
    this.targetObject.position.copy(this.startPosition).add(movement);
  }
  
  performRotation(delta) {
    const rotationSpeed = 0.02;
    const rotation = new THREE.Euler();
    
    switch (this.selectedAxis) {
      case 'x':
        rotation.x = delta.y * rotationSpeed;
        break;
      case 'y':
        rotation.y = delta.x * rotationSpeed;
        break;
      case 'z':
        rotation.z = delta.x * rotationSpeed;
        break;
    }
    
    this.targetObject.rotation.copy(this.startRotation);
    this.targetObject.rotateX(rotation.x);
    this.targetObject.rotateY(rotation.y);
    this.targetObject.rotateZ(rotation.z);
  }
  
  performScaling(delta) {
    const scaleSpeed = 0.01;
    const scale = new THREE.Vector3(1, 1, 1);
    
    if (this.selectedAxis === 'uniform') {
      const uniformScale = 1 + (delta.x + delta.y) * scaleSpeed;
      scale.set(uniformScale, uniformScale, uniformScale);
    } else {
      switch (this.selectedAxis) {
        case 'x':
          scale.x = 1 + delta.x * scaleSpeed;
          break;
        case 'y':
          scale.y = 1 + delta.y * scaleSpeed;
          break;
        case 'z':
          scale.z = 1 + delta.z * scaleSpeed;
          break;
      }
    }
    
    this.targetObject.scale.copy(this.startScale).multiply(scale);
  }
  
  highlightAxis(axis) {
    this.gizmo.traverse((child) => {
      if (child.userData.axis === axis) {
        child.material = child.material.clone();
        child.material.color.setHex(0xffff00); // Yellow highlight
      }
    });
  }
  
  unhighlightAll() {
    this.gizmo.traverse((child) => {
      if (child.userData.axis) {
        const originalColor = this.getOriginalColor(child.userData.axis);
        child.material = child.material.clone();
        child.material.color.setHex(originalColor);
      }
    });
  }
  
  getOriginalColor(axis) {
    switch (axis) {
      case 'x': return 0xff0000; // Red
      case 'y': return 0x00ff00; // Green
      case 'z': return 0x0000ff; // Blue
      default: return 0xffffff; // White
    }
  }
  
  setMode(mode) {
    this.mode = mode;
    this.translateGizmo.visible = mode === 'translate';
    this.rotateGizmo.visible = mode === 'rotate';
    this.scaleGizmo.visible = mode === 'scale';
  }
  
  attachToObject(object) {
    this.targetObject = object;
    if (object) {
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
    const distance = this.camera.position.distanceTo(this.gizmo.position);
    const scale = distance * 0.1;
    this.gizmo.scale.setScalar(scale);
  }
  
  dispose() {
    this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
    this.renderer.domElement.removeEventListener('mouseup', this.onMouseUp);
  }
}