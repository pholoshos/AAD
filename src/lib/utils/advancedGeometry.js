import * as THREE from 'three';

/**
 * Advanced geometry manipulation utilities
 */
export class AdvancedGeometry {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  /**
   * Extrude faces along their normal
   * @param {THREE.BufferGeometry} geometry - Source geometry
   * @param {Array} faceIndices - Indices of faces to extrude
   * @param {number} distance - Extrusion distance
   * @returns {THREE.BufferGeometry} New extruded geometry
   */
  extrudeFaces(geometry, faceIndices, distance = 1) {
    const positions = geometry.attributes.position.array;
    const indices = geometry.index ? geometry.index.array : null;
    
    const newVertices = [];
    const newIndices = [];
    const extrudedVertices = new Map();
    
    // Copy original vertices
    for (let i = 0; i < positions.length; i += 3) {
      newVertices.push(positions[i], positions[i + 1], positions[i + 2]);
    }
    
    // Process each face to extrude
    faceIndices.forEach(faceIndex => {
      const i1 = indices[faceIndex * 3];
      const i2 = indices[faceIndex * 3 + 1];
      const i3 = indices[faceIndex * 3 + 2];
      
      // Calculate face normal
      const v1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
      const v2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);
      const v3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]);
      
      const normal = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(v2, v1),
          new THREE.Vector3().subVectors(v3, v1)
        )
        .normalize();
      
      // Create extruded vertices
      const extrudedIndices = [];
      [i1, i2, i3].forEach(vertexIndex => {
        if (!extrudedVertices.has(vertexIndex)) {
          const originalVertex = new THREE.Vector3(
            positions[vertexIndex * 3],
            positions[vertexIndex * 3 + 1],
            positions[vertexIndex * 3 + 2]
          );
          
          const extrudedVertex = originalVertex.clone().add(
            normal.clone().multiplyScalar(distance)
          );
          
          const newIndex = newVertices.length / 3;
          newVertices.push(extrudedVertex.x, extrudedVertex.y, extrudedVertex.z);
          extrudedVertices.set(vertexIndex, newIndex);
          extrudedIndices.push(newIndex);
        } else {
          extrudedIndices.push(extrudedVertices.get(vertexIndex));
        }
      });
      
      // Create side faces
      const originalIndices = [i1, i2, i3];
      for (let i = 0; i < 3; i++) {
        const next = (i + 1) % 3;
        const oi1 = originalIndices[i];
        const oi2 = originalIndices[next];
        const ei1 = extrudedIndices[i];
        const ei2 = extrudedIndices[next];
        
        // Two triangles for each edge
        newIndices.push(oi1, oi2, ei1);
        newIndices.push(oi2, ei2, ei1);
      }
      
      // Add extruded face (flipped normal)
      newIndices.push(extrudedIndices[0], extrudedIndices[2], extrudedIndices[1]);
    });
    
    // Add remaining original faces
    if (indices) {
      for (let i = 0; i < indices.length; i += 3) {
        const faceIndex = Math.floor(i / 3);
        if (!faceIndices.includes(faceIndex)) {
          newIndices.push(indices[i], indices[i + 1], indices[i + 2]);
        }
      }
    }
    
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();
    
    return newGeometry;
  }

  /**
   * Inset faces (scale faces inward)
   * @param {THREE.BufferGeometry} geometry - Source geometry
   * @param {Array} faceIndices - Indices of faces to inset
   * @param {number} insetAmount - Amount to inset (0-1)
   * @returns {THREE.BufferGeometry} New geometry with inset faces
   */
  insetFaces(geometry, faceIndices, insetAmount = 0.2) {
    const positions = geometry.attributes.position.array;
    const indices = geometry.index ? geometry.index.array : null;
    
    const newVertices = [...positions];
    const newIndices = [];
    
    faceIndices.forEach(faceIndex => {
      const i1 = indices[faceIndex * 3];
      const i2 = indices[faceIndex * 3 + 1];
      const i3 = indices[faceIndex * 3 + 2];
      
      // Calculate face center
      const v1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
      const v2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);
      const v3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]);
      
      const center = new THREE.Vector3()
        .addVectors(v1, v2)
        .add(v3)
        .divideScalar(3);
      
      // Create inset vertices
      const insetVertices = [];
      [v1, v2, v3].forEach(vertex => {
        const insetVertex = vertex.clone().lerp(center, insetAmount);
        const newIndex = newVertices.length / 3;
        newVertices.push(insetVertex.x, insetVertex.y, insetVertex.z);
        insetVertices.push(newIndex);
      });
      
      // Create new faces
      newIndices.push(insetVertices[0], insetVertices[1], insetVertices[2]);
      
      // Create side faces
      const originalIndices = [i1, i2, i3];
      for (let i = 0; i < 3; i++) {
        const next = (i + 1) % 3;
        newIndices.push(
          originalIndices[i],
          originalIndices[next],
          insetVertices[i]
        );
        newIndices.push(
          originalIndices[next],
          insetVertices[next],
          insetVertices[i]
        );
      }
    });
    
    // Add remaining original faces
    if (indices) {
      for (let i = 0; i < indices.length; i += 3) {
        const faceIndex = Math.floor(i / 3);
        if (!faceIndices.includes(faceIndex)) {
          newIndices.push(indices[i], indices[i + 1], indices[i + 2]);
        }
      }
    }
    
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();
    
    return newGeometry;
  }

  /**
   * Subdivide geometry for smoother surfaces
   * @param {THREE.BufferGeometry} geometry - Source geometry
   * @param {number} iterations - Number of subdivision iterations
   * @returns {THREE.BufferGeometry} Subdivided geometry
   */
  subdivide(geometry, iterations = 1) {
    // Simple subdivision - can be enhanced with Loop or Catmull-Clark
    let currentGeometry = geometry.clone();
    
    for (let iter = 0; iter < iterations; iter++) {
      const positions = currentGeometry.attributes.position.array;
      const indices = currentGeometry.index.array;
      
      const newVertices = [...positions];
      const newIndices = [];
      const edgeVertices = new Map();
      
      // Process each triangle
      for (let i = 0; i < indices.length; i += 3) {
        const i1 = indices[i];
        const i2 = indices[i + 1];
        const i3 = indices[i + 2];
        
        // Get or create edge midpoints
        const edges = [
          [i1, i2], [i2, i3], [i3, i1]
        ];
        
        const midpoints = edges.map(([a, b]) => {
          const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
          if (!edgeVertices.has(key)) {
            const v1 = new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]);
            const v2 = new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
            const midpoint = v1.clone().add(v2).divideScalar(2);
            
            const newIndex = newVertices.length / 3;
            newVertices.push(midpoint.x, midpoint.y, midpoint.z);
            edgeVertices.set(key, newIndex);
            return newIndex;
          }
          return edgeVertices.get(key);
        });
        
        // Create 4 new triangles
        newIndices.push(i1, midpoints[0], midpoints[2]);
        newIndices.push(midpoints[0], i2, midpoints[1]);
        newIndices.push(midpoints[2], midpoints[1], i3);
        newIndices.push(midpoints[0], midpoints[1], midpoints[2]);
      }
      
      currentGeometry = new THREE.BufferGeometry();
      currentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
      currentGeometry.setIndex(newIndices);
      currentGeometry.computeVertexNormals();
    }
    
    return currentGeometry;
  }

  /**
   * Get face index from intersection point
   * @param {THREE.Intersection} intersection - Raycast intersection
   * @returns {number} Face index
   */
  getFaceIndex(intersection) {
    return intersection.faceIndex;
  }
}