<script>
  import { sceneObjects, selectedObjectId, transformMode, sceneActions, editMode, gizmoMode } from '../stores/sceneStore.js';
  import { structureTemplates, loadTemplate } from '../utils/templates.js';
  
  let showTemplates = false;
  let showCurvedShapes = false;
  
  function handleTemplateSelect(templateName) {
    loadTemplate(templateName, sceneActions);
    showTemplates = false;
  }
  
  function addPrimitive(type) {
    const primitiveConfigs = {
      cube: { width: 1, height: 1, depth: 1 },
      sphere: { radius: 0.5 },
      cylinder: { radius: 0.5, height: 1 },
      plane: { width: 2, height: 2 },
      // Curved shapes configurations
      torus: { radius: 0.5, tube: 0.2, radialSegments: 16, tubularSegments: 100 },
      cone: { radius: 0.5, height: 1, radialSegments: 32 },
      torusKnot: { radius: 0.5, tube: 0.15, tubularSegments: 100, radialSegments: 16, p: 2, q: 3 },
      ring: { innerRadius: 0.2, outerRadius: 0.5, thetaSegments: 32 },
      dodecahedron: { radius: 0.5, detail: 0 },
      icosahedron: { radius: 0.5, detail: 0 },
      octahedron: { radius: 0.5, detail: 0 },
      tetrahedron: { radius: 0.5, detail: 0 }
    };
    
    sceneActions.addObject({
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${$sceneObjects.length + 1}`,
      material: { color: '#3b82f6' },
      geometry: primitiveConfigs[type]
    });
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
</script>

<div class="bg-white border-b border-gray-200 px-4 py-2">
  <div class="flex items-center space-x-4">
    <!-- Templates Dropdown -->
    <div class="relative">
      <button 
        on:click={() => showTemplates = !showTemplates}
        class="btn-primary flex items-center space-x-2"
      >
        <span>📐</span>
        <span>Templates</span>
        <span class="text-xs">▼</span>
      </button>
      
      {#if showTemplates}
        <div class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
          {#each Object.entries(structureTemplates) as [key, template]}
            <button
              on:click={() => handleTemplateSelect(key)}
              class="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              <div class="font-medium">{template.name}</div>
              <div class="text-sm text-gray-500">{template.description}</div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Basic Primitives -->
    <div class="flex space-x-2">
      <button on:click={() => addPrimitive('cube')} class="btn-secondary" title="Add Cube">🟦</button>
      <button on:click={() => addPrimitive('sphere')} class="btn-secondary" title="Add Sphere">🔵</button>
      <button on:click={() => addPrimitive('cylinder')} class="btn-secondary" title="Add Cylinder">🟫</button>
      <button on:click={() => addPrimitive('plane')} class="btn-secondary" title="Add Plane">⬜</button>
    </div>
    
    <!-- Curved Shapes Dropdown -->
    <div class="relative">
      <button 
        on:click={() => showCurvedShapes = !showCurvedShapes}
        class="btn-secondary flex items-center space-x-2"
        title="Curved Shapes"
      >
        <span>🌀</span>
        <span>Curved</span>
        <span class="text-xs">▼</span>
      </button>
      
      {#if showCurvedShapes}
        <div class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
          <button on:click={() => { addPrimitive('torus'); showCurvedShapes = false; }} class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <span>🍩</span><span>Torus</span>
          </button>
          <button on:click={() => { addPrimitive('cone'); showCurvedShapes = false; }} class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <span>🔺</span><span>Cone</span>
          </button>
          <button on:click={() => { addPrimitive('torusKnot'); showCurvedShapes = false; }} class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <span>🪢</span><span>Torus Knot</span>
          </button>
          <button on:click={() => { addPrimitive('ring'); showCurvedShapes = false; }} class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <span>⭕</span><span>Ring</span>
          </button>
          <button on:click={() => { addPrimitive('dodecahedron'); showCurvedShapes = false; }} class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <span>⬢</span><span>Dodecahedron</span>
          </button>
          <button on:click={() => { addPrimitive('icosahedron'); showCurvedShapes = false; }} class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <span>💎</span><span>Icosahedron</span>
          </button>
          <button on:click={() => { addPrimitive('octahedron'); showCurvedShapes = false; }} class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <span>🔶</span><span>Octahedron</span>
          </button>
          <button on:click={() => { addPrimitive('tetrahedron'); showCurvedShapes = false; }} class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <span>🔻</span><span>Tetrahedron</span>
          </button>
        </div>
      {/if}
    </div>
    
    <!-- Transform Tools -->
    <div class="flex space-x-1 border-l border-gray-300 pl-4">
      <button 
        on:click={() => sceneActions.setGizmoMode('translate')}
        class="btn-secondary {$gizmoMode === 'translate' ? 'bg-blue-100' : ''}"
        title="Move (G)"
      >
        ↔️
      </button>
      <button 
        on:click={() => sceneActions.setGizmoMode('rotate')}
        class="btn-secondary {$gizmoMode === 'rotate' ? 'bg-blue-100' : ''}"
        title="Rotate (R)"
      >
        🔄
      </button>
      <button 
        on:click={() => sceneActions.setGizmoMode('scale')}
        class="btn-secondary {$gizmoMode === 'scale' ? 'bg-blue-100' : ''}"
        title="Scale (S)"
      >
        📏
      </button>
      <button 
        on:click={() => sceneActions.setGizmoMode('cut')}
        class="btn-secondary {$gizmoMode === 'cut' ? 'bg-red-100' : ''}"
        title="Cut Tool (C)"
      >
        ✂️
      </button>
    </div>
    
    <!-- Edit Mode -->
    <div class="border-l border-gray-300 pl-4">
      <button 
        on:click={() => $editMode === 'object' ? sceneActions.enterEditMode($selectedObjectId) : sceneActions.exitEditMode()}
        class="btn-secondary {$editMode === 'edit' ? 'bg-green-100' : ''}"
        disabled={!$selectedObjectId}
        title="Edit Mode (Tab)"
      >
        {$editMode === 'edit' ? '✏️ Exit Edit' : '✏️ Edit'}
      </button>
    </div>
    
    <!-- Quick Actions -->
    <div class="border-l border-gray-300 pl-4 flex space-x-2">
      <button 
        on:click={duplicateSelected}
        class="btn-secondary"
        disabled={!$selectedObjectId}
        title="Duplicate (Shift+D)"
      >
        📋
      </button>
      <button 
        on:click={() => sceneActions.removeObject($selectedObjectId)}
        class="btn-secondary text-red-600"
        disabled={!$selectedObjectId}
        title="Delete (X)"
      >
        🗑️
      </button>
    </div>
  </div>
</div>

