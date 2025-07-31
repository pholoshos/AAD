<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { sceneObjects, selectedObjectId, sceneSettings, transformMode, sceneActions, editMode, selectedFaces, gizmoMode } from '../stores/sceneStore.js';
  import { initializeThreeJS, createGeometry, createMaterial } from '../utils/threeSetup.js';
  import { AdvancedGeometry } from '../utils/advancedGeometry.js';
  import { TransformGizmo } from '../utils/transformGizmo.js';
  import { FaceExtrusionGizmo } from '../utils/faceExtrusion.js';
  
  let canvasContainer;
  let scene, camera, renderer, gridHelper;
  let meshes = new Map();
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();
  let controls;
  let animationId;
  
  // Gizmos
  let transformGizmo;
  let faceExtrusionGizmo;
  
  // Camera controls
  let isMouseDown = false;
  let mouseX = 0, mouseY = 0;
  let cameraDistance = 10;
  let cameraTheta = 0;
  let cameraPhi = Math.PI / 4;
  
  onMount(async () => {
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    
    // Initialize Three.js
    const threeSetup = initializeThreeJS(canvasContainer);
    scene = threeSetup.scene;
    camera = threeSetup.camera;
    renderer = threeSetup.renderer;
    gridHelper = threeSetup.gridHelper;
    
    // Setup orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    
    // Initialize gizmos
    transformGizmo = new TransformGizmo(camera, renderer);
    faceExtrusionGizmo = new FaceExtrusionGizmo(camera, renderer);
    scene.add(transformGizmo.gizmo);
    scene.add(faceExtrusionGizmo.gizmo);
    
    // Add event listeners
    renderer.domElement.addEventListener('click', onCanvasClick);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('keydown', handleKeyDown);
    }
    
    // Start animation loop
    animate();
  });
  
  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
    }
    if (transformGizmo) {
      transformGizmo.dispose();
    }
    if (faceExtrusionGizmo) {
      faceExtrusionGizmo.dispose();
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('keydown', handleKeyDown);
    }
  });
  
  function handleKeyDown(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    
    switch (event.key.toLowerCase()) {
      case 'g':
        event.preventDefault();
        sceneActions.setGizmoMode('translate');
        if (transformGizmo) transformGizmo.setMode('translate');
        break;
      case 'r':
        event.preventDefault();
        sceneActions.setGizmoMode('rotate');
        if (transformGizmo) transformGizmo.setMode('rotate');
        break;
      case 's':
        event.preventDefault();
        sceneActions.setGizmoMode('scale');
        if (transformGizmo) transformGizmo.setMode('scale');
        break;
      case 'tab':
        event.preventDefault();
        if ($selectedObjectId) {
          if ($editMode === 'object') {
            sceneActions.enterEditMode($selectedObjectId);
          } else {
            sceneActions.exitEditMode();
          }
        }
        break;
      case 'x':
      case 'delete':
        event.preventDefault();
        if ($selectedObjectId) {
          sceneActions.removeObject($selectedObjectId);
        }
        break;
      case 'd':
        if (event.shiftKey) {
          event.preventDefault();
          duplicateSelected();
        }
        break;
    }
  }
  
  function duplicateSelected() {
    if (!$selectedObjectId) return;
    
    const selectedObj = $sceneObjects.find(obj => obj.id === $selectedObjectId);
    if (selectedObj) {
      const duplicate = {
        ...selectedObj,
        name: selectedObj.name + ' Copy',
        position: {
          x: selectedObj.position.x + 1,
          y: selectedObj.position.y,
          z: selectedObj.position.z
        }
      };
      delete duplicate.id;
      sceneActions.addObject(duplicate);
    }
  }
  
  // Reactive updates
  $: updateSceneMeshes($sceneObjects, $selectedObjectId);
  $: updateGridVisibility($sceneSettings.gridVisible);
  $: updateGizmoMode($gizmoMode);
  $: updateSelectedObject($selectedObjectId);
  $: updateEditMode($editMode, $selectedFaces);
  
  function updateGizmoMode(mode) {
    if (transformGizmo) {
      transformGizmo.setMode(mode);
    }
  }
  
  function updateSelectedObject(selectedId) {
    if (transformGizmo) {
      const selectedMesh = selectedId ? meshes.get(selectedId) : null;
      transformGizmo.attachToObject(selectedMesh);
    }
  }
  
  function updateEditMode(mode, faces) {
    if (mode === 'edit' && $selectedObjectId) {
      const selectedMesh = meshes.get($selectedObjectId);
      if (faceExtrusionGizmo && selectedMesh) {
        faceExtrusionGizmo.attachToFaces(selectedMesh, faces);
      }
      if (transformGizmo) {
        transformGizmo.hide();
      }
    } else {
      if (faceExtrusionGizmo) {
        faceExtrusionGizmo.hide();
      }
      if (transformGizmo && $selectedObjectId) {
        const selectedMesh = meshes.get($selectedObjectId);
        transformGizmo.attachToObject(selectedMesh);
      }
    }
  }
  
  function updateSceneMeshes(objects, selectedId) {
    if (!scene) return;
    
    // Remove meshes that no longer exist
    const currentIds = new Set(objects.map(obj => obj.id));
    for (const [id, mesh] of meshes) {
      if (!currentIds.has(id)) {
        scene.remove(mesh);
        meshes.delete(id);
      }
    }
    
    // Add or update meshes
    objects.forEach(obj => {
      let mesh = meshes.get(obj.id);
      
      if (!mesh) {
        // Create new mesh
        const geometry = createGeometry(obj.type, obj.geometry);
        const material = createMaterial(obj.material, obj.id === selectedId);
        mesh = new THREE.Mesh(geometry, material);
        // Remove shadow properties since we're not using lighting
        // mesh.castShadow = true;
        // mesh.receiveShadow = true;
        mesh.userData = { objectId: obj.id };
        
        scene.add(mesh);
        meshes.set(obj.id, mesh);
      } else {
        // Update existing mesh material for selection
        mesh.material = createMaterial(obj.material, obj.id === selectedId);
      }
      
      // Update transform
      mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
      mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
      mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
      mesh.visible = obj.visible;
    });
  }
  
  function updateGridVisibility(visible) {
    if (gridHelper) {
      gridHelper.visible = visible;
    }
  }
  
  let advancedGeometry = new AdvancedGeometry();
  let faceHighlightMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff6b35, 
    transparent: true, 
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  
  if (typeof window !== 'undefined') {
    window.meshRegistry = new Map();
  }
  
  function onCanvasClick(event) {
    // Skip if gizmo is being interacted with
    if (transformGizmo && transformGizmo.isDragging) return;
    if (faceExtrusionGizmo && faceExtrusionGizmo.isDragging) return;
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const meshArray = Array.from(meshes.values());
    const intersects = raycaster.intersectObjects(meshArray);
    
    if (intersects.length > 0) {
      const selectedMesh = intersects[0].object;
      const objectId = selectedMesh.userData.objectId;
      
      if ($editMode === 'edit' && $selectedObjectId === objectId) {
        // Face selection in edit mode
        const faceIndex = intersects[0].faceIndex;
        sceneActions.selectFace(faceIndex);
        updateFaceHighlights(selectedMesh);
      } else {
        // Object selection
        sceneActions.selectObject(objectId);
        if ($editMode === 'edit') {
          sceneActions.exitEditMode();
        }
      }
    } else {
      sceneActions.clearSelection();
      if ($editMode === 'edit') {
        sceneActions.exitEditMode();
      }
    }
  }
  
  function updateFaceHighlights(mesh) {
    // Remove existing highlights
    const highlights = scene.children.filter(child => child.userData.isHighlight);
    highlights.forEach(highlight => scene.remove(highlight));
    
    // Add new highlights for selected faces
    $selectedFaces.forEach(faceIndex => {
      const highlightGeometry = createFaceHighlight(mesh.geometry, faceIndex);
      const highlightMesh = new THREE.Mesh(highlightGeometry, faceHighlightMaterial);
      highlightMesh.userData.isHighlight = true;
      highlightMesh.position.copy(mesh.position);
      highlightMesh.rotation.copy(mesh.rotation);
      highlightMesh.scale.copy(mesh.scale);
      scene.add(highlightMesh);
    });
  }
  
  function createFaceHighlight(geometry, faceIndex) {
    const positions = geometry.attributes.position.array;
    const indices = geometry.index ? geometry.index.array : null;
    
    const i1 = indices[faceIndex * 3];
    const i2 = indices[faceIndex * 3 + 1];
    const i3 = indices[faceIndex * 3 + 2];
    
    const highlightGeometry = new THREE.BufferGeometry();
    const highlightVertices = [
      positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2],
      positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2],
      positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]
    ];
    
    highlightGeometry.setAttribute('position', new THREE.Float32BufferAttribute(highlightVertices, 3));
    highlightGeometry.setIndex([0, 1, 2]);
    
    return highlightGeometry;
  }
  
  function onWindowResize() {
    if (!camera || !renderer || !canvasContainer) return;
    
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  }
  
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (controls) {
      controls.update();
    }
    
    // Update gizmo sizes based on camera distance
    if (transformGizmo && transformGizmo.isVisible) {
      transformGizmo.updateSize();
    }
    
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }
</script>

<div 
  bind:this={canvasContainer} 
  class="w-full h-full bg-gray-100 relative overflow-hidden"
  style="cursor: crosshair;"
>
  <!-- Canvas will be inserted here by Three.js -->
</div>