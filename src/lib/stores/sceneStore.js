import { writable, derived } from 'svelte/store';
import { generateId, calculateVolume, calculateMass, calculateCost } from '../utils/objectFactory.js';

// Main scene objects store
export const sceneObjects = writable([]);

// Selected object store
export const selectedObjectId = writable(null);

// Camera and scene settings
export const sceneSettings = writable({
  gridVisible: true,
  snapToGrid: true,
  gridSize: 1,
  defaultUnits: 'cm',
  showDimensions: true,
  showMaterials: true
});

// Transform mode (move, rotate, scale)
export const transformMode = writable('move');

// Edit mode store
export const editMode = writable('object'); // 'object' or 'edit'

// Selected faces in edit mode
export const selectedFaces = writable([]);

// Transform gizmo mode
export const gizmoMode = writable('translate'); // 'translate', 'rotate', 'scale'

// Derived store for selected object
export const selectedObject = derived(
  [sceneObjects, selectedObjectId],
  ([$sceneObjects, $selectedObjectId]) => {
    return $sceneObjects.find(obj => obj.id === $selectedObjectId) || null;
  }
);

// Enhanced scene actions
export const sceneActions = {
  addObject: (objectData) => {
    const newObject = {
      id: generateId(),
      ...objectData,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      ...objectData
    };
    
    // Calculate engineering properties
    newObject.properties = calculateObjectProperties(newObject);
    
    sceneObjects.update(objects => [...objects, newObject]);
    selectedObjectId.set(newObject.id);
    return newObject.id;
  },
  
  removeObject: (id) => {
    sceneObjects.update(objects => objects.filter(obj => obj.id !== id));
    selectedObjectId.update(currentId => currentId === id ? null : currentId);
  },
  
  updateObject: (id, updates) => {
    sceneObjects.update(objects => 
      objects.map(obj => {
        if (obj.id === id) {
          const updatedObj = { ...obj, ...updates };
          // Recalculate properties if geometry or material changed
          if (updates.geometry || updates.material) {
            updatedObj.properties = calculateObjectProperties(updatedObj);
          }
          return updatedObj;
        }
        return obj;
      })
    );
  },
  
  selectObject: (id) => {
    selectedObjectId.set(id);
  },
  
  clearSelection: () => {
    selectedObjectId.set(null);
  },
  
  clearScene: () => {
    sceneObjects.set([]);
    selectedObjectId.set(null);
  },
  
  enterEditMode: (objectId) => {
    selectedObjectId.set(objectId);
    editMode.set('edit');
    selectedFaces.set([]);
  },
  
  exitEditMode: () => {
    editMode.set('object');
    selectedFaces.set([]);
  },
  
  selectFace: (faceIndex) => {
    selectedFaces.update(faces => {
      if (faces.includes(faceIndex)) {
        return faces.filter(f => f !== faceIndex);
      } else {
        return [...faces, faceIndex];
      }
    });
  },
  
  clearFaceSelection: () => {
    selectedFaces.set([]);
  },
  
  setGizmoMode: (mode) => {
    gizmoMode.set(mode);
  }
};

// Calculate engineering properties
function calculateObjectProperties(obj) {
  const volume = calculateVolume(obj.type, obj.geometry, obj.units?.length || 'cm');
  const mass = calculateMass(volume, obj.material);
  const cost = calculateCost(mass, obj.material);
  
  return {
    volume: parseFloat(volume.toFixed(6)), // m³
    mass: parseFloat(mass.toFixed(3)), // kg
    cost: parseFloat(cost.toFixed(2)), // $
    surfaceArea: 0 // TODO: Implement surface area calculation
  };
}