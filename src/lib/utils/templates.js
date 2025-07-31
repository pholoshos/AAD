export const structureTemplates = {
  house: {
    name: 'Simple House',
    description: 'Basic house structure with walls, roof, and foundation',
    objects: [
      {
        type: 'cube',
        name: 'Foundation',
        material: { color: '#8B4513' },
        geometry: { width: 8, height: 0.5, depth: 6 },
        position: { x: 0, y: -0.25, z: 0 }
      },
      {
        type: 'cube',
        name: 'Wall Front',
        material: { color: '#D2B48C' },
        geometry: { width: 8, height: 3, depth: 0.2 },
        position: { x: 0, y: 1.5, z: 3 }
      },
      {
        type: 'cube',
        name: 'Wall Back',
        material: { color: '#D2B48C' },
        geometry: { width: 8, height: 3, depth: 0.2 },
        position: { x: 0, y: 1.5, z: -3 }
      },
      {
        type: 'cube',
        name: 'Wall Left',
        material: { color: '#D2B48C' },
        geometry: { width: 0.2, height: 3, depth: 6 },
        position: { x: -4, y: 1.5, z: 0 }
      },
      {
        type: 'cube',
        name: 'Wall Right',
        material: { color: '#D2B48C' },
        geometry: { width: 0.2, height: 3, depth: 6 },
        position: { x: 4, y: 1.5, z: 0 }
      },
      {
        type: 'cube',
        name: 'Roof',
        material: { color: '#8B0000' },
        geometry: { width: 9, height: 0.3, depth: 7 },
        position: { x: 0, y: 3.5, z: 0 },
        rotation: { x: 0.2, y: 0, z: 0 }
      }
    ]
  },
  bridge: {
    name: 'Simple Bridge',
    description: 'Basic bridge structure with deck and supports',
    objects: [
      {
        type: 'cube',
        name: 'Bridge Deck',
        material: { color: '#696969' },
        geometry: { width: 12, height: 0.3, depth: 2 },
        position: { x: 0, y: 2, z: 0 }
      },
      {
        type: 'cube',
        name: 'Support Left',
        material: { color: '#2F4F4F' },
        geometry: { width: 0.5, height: 4, depth: 0.5 },
        position: { x: -5, y: 0, z: 0 }
      },
      {
        type: 'cube',
        name: 'Support Right',
        material: { color: '#2F4F4F' },
        geometry: { width: 0.5, height: 4, depth: 0.5 },
        position: { x: 5, y: 0, z: 0 }
      },
      {
        type: 'cube',
        name: 'Railing Left',
        material: { color: '#4682B4' },
        geometry: { width: 12, height: 0.1, depth: 0.1 },
        position: { x: 0, y: 3, z: 1 }
      },
      {
        type: 'cube',
        name: 'Railing Right',
        material: { color: '#4682B4' },
        geometry: { width: 12, height: 0.1, depth: 0.1 },
        position: { x: 0, y: 3, z: -1 }
      }
    ]
  }
};

export function loadTemplate(templateName, sceneActions) {
  const template = structureTemplates[templateName];
  if (!template) return;
  
  // Clear existing scene
  sceneActions.clearScene();
  
  // Add template objects
  template.objects.forEach(objData => {
    sceneActions.addObject(objData);
  });
}