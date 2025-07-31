import { OBJECT_TYPES, DEFAULT_MATERIALS, ENGINEERING_MATERIALS } from '../types/objects.js';

let objectCounter = 0;

export function generateId() {
  return `obj_${Date.now()}_${++objectCounter}`;
}

export function createObjectData(type, overrides = {}) {
  const baseData = {
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${objectCounter + 1}`,
    material: DEFAULT_MATERIALS[type],
    geometry: getDefaultGeometry(type),
    // Engineering documentation
    documentation: {
      notes: '',
      specifications: '',
      partNumber: `P${String(objectCounter + 1).padStart(4, '0')}`,
      revision: 'A',
      designer: '',
      dateCreated: new Date().toISOString().split('T')[0]
    },
    // Measurement settings
    units: {
      length: 'cm', // Default to centimeters
      displayPrecision: 2
    },
    // Engineering properties
    properties: {
      volume: 0, // Will be calculated
      mass: 0, // Will be calculated based on material density
      surfaceArea: 0, // Will be calculated
      cost: 0 // Will be calculated
    }
  };
  
  return { ...baseData, ...overrides };
}

function getDefaultGeometry(type) {
  switch (type) {
    case OBJECT_TYPES.CUBE:
      return { width: 10, height: 10, depth: 10 }; // 10cm default
    case OBJECT_TYPES.SPHERE:
      return { radius: 5, widthSegments: 32, heightSegments: 16 }; // 5cm radius
    case OBJECT_TYPES.CYLINDER:
      return { radiusTop: 5, radiusBottom: 5, height: 10, radialSegments: 32 }; // 5cm radius, 10cm height
    default:
      return {};
  }
}

// Utility functions for engineering calculations
export function calculateVolume(type, geometry, units = 'cm') {
  const factor = getUnitFactor(units);
  
  switch (type) {
    case OBJECT_TYPES.CUBE:
      return (geometry.width * geometry.height * geometry.depth) * Math.pow(factor, 3);
    case OBJECT_TYPES.SPHERE:
      return (4/3) * Math.PI * Math.pow(geometry.radius, 3) * Math.pow(factor, 3);
    case OBJECT_TYPES.CYLINDER:
      return Math.PI * Math.pow(geometry.radiusTop, 2) * geometry.height * Math.pow(factor, 3);
    default:
      return 0;
  }
}

export function calculateMass(volume, material) {
  return volume * material.density; // volume in m³, density in kg/m³
}

export function calculateCost(mass, material) {
  return mass * material.cost;
}

function getUnitFactor(unit) {
  const factors = {
    'mm': 0.001,
    'cm': 0.01,
    'm': 1.0,
    'in': 0.0254,
    'ft': 0.3048
  };
  return factors[unit] || 1.0;
}