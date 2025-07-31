import * as THREE from 'three';

/**
 * Export scene to STL format
 * @param {Array} objects - Scene objects
 * @returns {string} STL file content
 */
export function exportToSTL(objects) {
  let stlString = '';
  
  objects.forEach(obj => {
    const geometry = createGeometryFromObject(obj);
    const mesh = new THREE.Mesh(geometry);
    
    // Apply transformations
    mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
    mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
    mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
    
    mesh.updateMatrixWorld();
    
    // Convert to STL format (simplified)
    const vertices = geometry.attributes.position.array;
    const indices = geometry.index ? geometry.index.array : null;
    
    stlString += generateSTLFromVertices(vertices, indices, mesh.matrixWorld);
  });
  
  return `solid CADModel\n${stlString}endsolid CADModel\n`;
}

/**
 * Export scene to OBJ format
 * @param {Array} objects - Scene objects
 * @returns {string} OBJ file content
 */
export function exportToOBJ(objects) {
  let objString = '# CAD Model Export\n';
  let vertexOffset = 1;
  
  objects.forEach((obj, index) => {
    objString += `o ${obj.name || `Object${index + 1}`}\n`;
    
    const geometry = createGeometryFromObject(obj);
    const mesh = new THREE.Mesh(geometry);
    
    // Apply transformations
    mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
    mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
    mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
    
    mesh.updateMatrixWorld();
    
    const vertices = geometry.attributes.position.array;
    const indices = geometry.index ? geometry.index.array : null;
    
    // Add vertices
    for (let i = 0; i < vertices.length; i += 3) {
      const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
      vertex.applyMatrix4(mesh.matrixWorld);
      objString += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
    }
    
    // Add faces
    if (indices) {
      for (let i = 0; i < indices.length; i += 3) {
        objString += `f ${indices[i] + vertexOffset} ${indices[i + 1] + vertexOffset} ${indices[i + 2] + vertexOffset}\n`;
      }
    } else {
      for (let i = 0; i < vertices.length / 3; i += 3) {
        objString += `f ${i + vertexOffset} ${i + 1 + vertexOffset} ${i + 2 + vertexOffset}\n`;
      }
    }
    
    vertexOffset += vertices.length / 3;
  });
  
  return objString;
}

function createGeometryFromObject(obj) {
  switch (obj.type) {
    case 'cube':
      return new THREE.BoxGeometry(
        obj.geometry.width,
        obj.geometry.height,
        obj.geometry.depth
      );
    case 'sphere':
      return new THREE.SphereGeometry(
        obj.geometry.radius,
        obj.geometry.widthSegments,
        obj.geometry.heightSegments
      );
    case 'cylinder':
      return new THREE.CylinderGeometry(
        obj.geometry.radiusTop,
        obj.geometry.radiusBottom,
        obj.geometry.height,
        obj.geometry.radialSegments
      );
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function generateSTLFromVertices(vertices, indices, matrix) {
  let stl = '';
  const triangles = indices ? indices.length / 3 : vertices.length / 9;
  
  for (let i = 0; i < triangles; i++) {
    const i1 = indices ? indices[i * 3] * 3 : i * 9;
    const i2 = indices ? indices[i * 3 + 1] * 3 : i * 9 + 3;
    const i3 = indices ? indices[i * 3 + 2] * 3 : i * 9 + 6;
    
    const v1 = new THREE.Vector3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]).applyMatrix4(matrix);
    const v2 = new THREE.Vector3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]).applyMatrix4(matrix);
    const v3 = new THREE.Vector3(vertices[i3], vertices[i3 + 1], vertices[i3 + 2]).applyMatrix4(matrix);
    
    const normal = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(v2, v1),
      new THREE.Vector3().subVectors(v3, v1)
    ).normalize();
    
    stl += `  facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
    stl += `    outer loop\n`;
    stl += `      vertex ${v1.x} ${v1.y} ${v1.z}\n`;
    stl += `      vertex ${v2.x} ${v2.y} ${v2.z}\n`;
    stl += `      vertex ${v3.x} ${v3.y} ${v3.z}\n`;
    stl += `    endloop\n`;
    stl += `  endfacet\n`;
  }
  
  return stl;
}

/**
 * Download file with given content
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('downloadFile can only be used in browser environment');
    return;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}