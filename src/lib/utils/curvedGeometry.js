import * as THREE from 'three';

/**
 * Advanced curved geometry utilities
 */
export class CurvedGeometry {
  /**
   * Create a parametric surface
   * @param {Function} func - Parametric function (u, v) => Vector3
   * @param {number} slices - Number of slices in u direction
   * @param {number} stacks - Number of stacks in v direction
   * @returns {THREE.BufferGeometry}
   */
  static createParametricSurface(func, slices = 32, stacks = 32) {
    const geometry = new THREE.ParametricGeometry(func, slices, stacks);
    return geometry;
  }

  /**
   * Create a spiral geometry
   * @param {Object} params - Spiral parameters
   * @returns {THREE.BufferGeometry}
   */
  static createSpiral(params = {}) {
    const {
      radius = 1,
      height = 2,
      turns = 3,
      segments = 100,
      tubeRadius = 0.1
    } = params;

    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: segments }, (_, i) => {
        const t = i / (segments - 1);
        const angle = t * turns * Math.PI * 2;
        return new THREE.Vector3(
          Math.cos(angle) * radius,
          t * height - height / 2,
          Math.sin(angle) * radius
        );
      })
    );

    return new THREE.TubeGeometry(curve, segments, tubeRadius, 8, false);
  }

  /**
   * Create a wave surface
   * @param {Object} params - Wave parameters
   * @returns {THREE.BufferGeometry}
   */
  static createWaveSurface(params = {}) {
    const {
      width = 2,
      height = 2,
      widthSegments = 32,
      heightSegments = 32,
      amplitude = 0.2,
      frequency = 2
    } = params;

    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      positions[i + 2] = Math.sin(x * frequency) * Math.cos(y * frequency) * amplitude;
    }

    geometry.computeVertexNormals();
    return geometry;
  }

  /**
   * Create a mobius strip
   * @param {Object} params - Mobius strip parameters
   * @returns {THREE.BufferGeometry}
   */
  static createMobiusStrip(params = {}) {
    const { radius = 1, width = 0.5, segments = 64 } = params;

    const mobiusFunction = (u, v, target) => {
      u = u * 2 * Math.PI;
      v = (v - 0.5) * width;
      
      const x = (radius + v * Math.cos(u / 2)) * Math.cos(u);
      const y = (radius + v * Math.cos(u / 2)) * Math.sin(u);
      const z = v * Math.sin(u / 2);
      
      target.set(x, y, z);
    };

    return new THREE.ParametricGeometry(mobiusFunction, segments, segments / 4);
  }
}