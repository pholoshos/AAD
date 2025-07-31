// Object type definitions
export const OBJECT_TYPES = {
  CUBE: 'cube',
  SPHERE: 'sphere',
  CYLINDER: 'cylinder'
};

// Engineering material properties
export const ENGINEERING_MATERIALS = {
  steel: {
    name: 'Steel',
    color: '#4682B4',
    density: 7850, // kg/m³
    youngsModulus: 200000, // MPa
    yieldStrength: 250, // MPa
    thermalConductivity: 50, // W/m·K
    cost: 0.8 // $/kg
  },
  aluminum: {
    name: 'Aluminum',
    color: '#C0C0C0',
    density: 2700,
    youngsModulus: 70000,
    yieldStrength: 276,
    thermalConductivity: 237,
    cost: 1.9
  },
  concrete: {
    name: 'Concrete',
    color: '#808080',
    density: 2400,
    youngsModulus: 30000,
    compressiveStrength: 30, // MPa
    thermalConductivity: 1.7,
    cost: 0.1
  },
  wood: {
    name: 'Wood (Pine)',
    color: '#8B4513',
    density: 500,
    youngsModulus: 9000,
    compressiveStrength: 40,
    thermalConductivity: 0.12,
    cost: 0.5
  },
  brick: {
    name: 'Brick',
    color: '#B22222',
    density: 1800,
    youngsModulus: 15000,
    compressiveStrength: 20,
    thermalConductivity: 0.6,
    cost: 0.3
  },
  glass: {
    name: 'Glass',
    color: '#87CEEB',
    density: 2500,
    youngsModulus: 70000,
    compressiveStrength: 1000,
    thermalConductivity: 1.0,
    cost: 2.0
  }
};

// Measurement units
export const UNITS = {
  LENGTH: {
    mm: { name: 'Millimeters', symbol: 'mm', factor: 0.001 },
    cm: { name: 'Centimeters', symbol: 'cm', factor: 0.01 },
    m: { name: 'Meters', symbol: 'm', factor: 1.0 },
    in: { name: 'Inches', symbol: 'in', factor: 0.0254 },
    ft: { name: 'Feet', symbol: 'ft', factor: 0.3048 }
  }
};

export const DEFAULT_MATERIALS = {
  [OBJECT_TYPES.CUBE]: ENGINEERING_MATERIALS.steel,
  [OBJECT_TYPES.SPHERE]: ENGINEERING_MATERIALS.aluminum,
  [OBJECT_TYPES.CYLINDER]: ENGINEERING_MATERIALS.concrete
};