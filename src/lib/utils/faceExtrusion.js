import * as THREE from 'three';

export class FaceExtrusionGizmo {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.gizmo = new THREE.Group();
    this.isVisible = false;
    this.selectedFaces = [];
    this.targetMesh = null;
    this.isDragging = false;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.plane = new THREE.Plane();
    this.intersection = new THREE.Vector3();
    this.startPosition = new THREE.Vector3();
    
    this.createExtrusionHandles();
    this.setupEventListeners();
  }
  
  createExtrusionHandles() {
    // Create arrow for face extrusion
    const arrowGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
    this.extrusionArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    this.extrusionArrow.userData = { type: 'extrude' };
    
    this.gizmo.add(this.extrusionArrow);
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
    if (!this.isVisible || this.selectedFaces.length === 0) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.extrusionArrow);
    
    if (intersects.length > 0) {
      event.stopPropagation();
      this.isDragging = true;
      this.startPosition.copy(this.gizmo.position);
      
      // Setup plane for extrusion
      const faceNormal = this.getFaceNormal();
      this.plane.setFromNormalAndCoplanarPoint(faceNormal, this.gizmo.position);
    }
  }
  
  onMouseMove(event) {
    if (!this.isDragging) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
      const distance = this.intersection.distanceTo(this.startPosition);
      this.performExtrusion(distance);
    }
  }
  
  onMouseUp(event) {
    if (this.isDragging) {
      this.isDragging = false;
    }
  }
  
  getFaceNormal() {
    // Calculate average normal of selected faces
    const normal = new THREE.Vector3();
    
    if (this.selectedFaces.length > 0 && this.targetMesh) {
      const geometry = this.targetMesh.geometry;
      const positions = geometry.attributes.position.array;
      const indices = geometry.index ? geometry.index.array : null;
      
      this.selectedFaces.forEach(faceIndex => {
        const i1 = indices[faceIndex * 3];
        const i2 = indices[faceIndex * 3 + 1];
        const i3 = indices[faceIndex * 3 + 2];
        
        const v1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
        const v2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);
        const v3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]);
        
        const faceNormal = new THREE.Vector3();
        faceNormal.crossVectors(v2.sub(v1), v3.sub(v1)).normalize();
        normal.add(faceNormal);
      });
      
      normal.normalize();
    }
    
    return normal.length() > 0 ? normal : new THREE.Vector3(0, 1, 0);
  }
  
  performExtrusion(distance) {
    // This would integrate with the AdvancedGeometry extrusion functionality
    console.log('Extruding faces by distance:', distance);
    // Implementation would call the extrusion method from AdvancedGeometry
  }
  
  attachToFaces(mesh, faceIndices) {
    this.targetMesh = mesh;
    this.selectedFaces = faceIndices;
    
    if (faceIndices.length > 0) {
      // Position gizmo at center of selected faces
      const center = this.calculateFaceCenter(mesh, faceIndices);
      this.gizmo.position.copy(center);
      
      // Orient arrow along face normal
      const normal = this.getFaceNormal();
      this.extrusionArrow.lookAt(this.gizmo.position.clone().add(normal));
      
      this.show();
    } else {
      this.hide();
    }
  }
  
  calculateFaceCenter(mesh, faceIndices) {
    const center = new THREE.Vector3();
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position.array;
    const indices = geometry.index ? geometry.index.array : null;
    
    let vertexCount = 0;
    
    faceIndices.forEach(faceIndex => {
      const i1 = indices[faceIndex * 3];
      const i2 = indices[faceIndex * 3 + 1];
      const i3 = indices[faceIndex * 3 + 2];
      
      center.add(new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]));
      center.add(new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]));
      center.add(new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]));
      vertexCount += 3;
    });
    
    center.divideScalar(vertexCount);
    return center;
  }
  
  show() {
    this.isVisible = true;
    this.gizmo.visible = true;
  }
  
  hide() {
    this.isVisible = false;
    this.gizmo.visible = false;
  }
  
  dispose() {
    this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
    this.renderer.domElement.removeEventListener('mouseup', this.onMouseUp);
  }
}