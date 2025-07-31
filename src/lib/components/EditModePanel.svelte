<script>
  import { selectedObject, sceneActions, editMode } from '../stores/sceneStore.js';
  import { AdvancedGeometry } from '../utils/advancedGeometry.js';
  
  let advancedGeometry = new AdvancedGeometry();
  let selectedFaces = [];
  let extrudeDistance = 1;
  let insetAmount = 0.2;
  let subdivisionLevels = 1;
  
  $: isEditMode = $editMode === 'edit';
  
  function enterEditMode() {
    editMode.set('edit');
    selectedFaces = [];
  }
  
  function exitEditMode() {
    editMode.set('object');
    selectedFaces = [];
  }
  
  function extrudeFaces() {
    if ($selectedObject && selectedFaces.length > 0) {
      const mesh = getMeshById($selectedObject.id);
      if (mesh) {
        const newGeometry = advancedGeometry.extrudeFaces(
          mesh.geometry,
          selectedFaces,
          extrudeDistance
        );
        
        // Update the mesh geometry
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
        
        // Update object in store
        sceneActions.updateObject($selectedObject.id, {
          geometry: { ...newGeometry.parameters }
        });
        
        selectedFaces = [];
      }
    }
  }
  
  function insetFaces() {
    if ($selectedObject && selectedFaces.length > 0) {
      const mesh = getMeshById($selectedObject.id);
      if (mesh) {
        const newGeometry = advancedGeometry.insetFaces(
          mesh.geometry,
          selectedFaces,
          insetAmount
        );
        
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
        
        sceneActions.updateObject($selectedObject.id, {
          geometry: { ...newGeometry.parameters }
        });
        
        selectedFaces = [];
      }
    }
  }
  
  function subdivideObject() {
    if ($selectedObject) {
      const mesh = getMeshById($selectedObject.id);
      if (mesh) {
        const newGeometry = advancedGeometry.subdivide(
          mesh.geometry,
          subdivisionLevels
        );
        
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
        
        sceneActions.updateObject($selectedObject.id, {
          geometry: { ...newGeometry.parameters }
        });
      }
    }
  }
  
  function getMeshById(id) {
    // This would need to be passed from the Canvas component
    // or accessed through a global mesh registry
    return window.meshRegistry?.get(id);
  }
</script>

<div class="panel p-4 m-4">
  <h3 class="text-lg font-semibold mb-4 text-gray-800">Edit Mode</h3>
  
  {#if !$selectedObject}
    <p class="text-gray-500 text-sm italic">Select an object to enter edit mode</p>
  {:else}
    <div class="space-y-4">
      <!-- Mode Toggle -->
      <div class="flex gap-2">
        <button 
          on:click={isEditMode ? exitEditMode : enterEditMode}
          class="btn-primary text-sm"
        >
          {isEditMode ? '🔙 Object Mode' : '✏️ Edit Mode'}
        </button>
      </div>
      
      {#if isEditMode}
        <!-- Face Selection Info -->
        <div class="bg-blue-50 p-3 rounded border">
          <p class="text-sm text-blue-800">
            <strong>Edit Mode Active</strong><br>
            Click faces to select them for operations.<br>
            Selected faces: {selectedFaces.length}
          </p>
        </div>
        
        <!-- Extrude Controls -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Extrude</label>
          <div class="flex gap-2 items-center">
            <input 
              type="number" 
              step="0.1"
              bind:value={extrudeDistance}
              class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Distance"
            />
            <button 
              on:click={extrudeFaces}
              disabled={selectedFaces.length === 0}
              class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔺 Extrude
            </button>
          </div>
        </div>
        
        <!-- Inset Controls -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Inset</label>
          <div class="flex gap-2 items-center">
            <input 
              type="number" 
              step="0.05"
              min="0"
              max="1"
              bind:value={insetAmount}
              class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Amount"
            />
            <button 
              on:click={insetFaces}
              disabled={selectedFaces.length === 0}
              class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📐 Inset
            </button>
          </div>
        </div>
        
        <!-- Subdivision Controls -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Subdivide</label>
          <div class="flex gap-2 items-center">
            <input 
              type="number" 
              min="1"
              max="4"
              bind:value={subdivisionLevels}
              class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Levels"
            />
            <button 
              on:click={subdivideObject}
              class="btn-primary text-sm"
            >
              🔀 Subdivide
            </button>
          </div>
        </div>
        
        <!-- Clear Selection -->
        <button 
          on:click={() => selectedFaces = []}
          class="w-full btn-secondary text-sm"
        >
          🗑️ Clear Selection
        </button>
      {/if}
    </div>
  {/if}
</div>