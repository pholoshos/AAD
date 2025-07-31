<script>
  import { sceneObjects, selectedObject, sceneActions, sceneSettings } from '../stores/sceneStore.js';
  import { ENGINEERING_MATERIALS, UNITS } from '../types/objects.js';
  
  let activeTab = 'properties'; // 'properties', 'documentation', 'materials'
  
  function applyMaterialPreset(materialKey) {
    if ($selectedObject) {
      sceneActions.updateObject($selectedObject.id, {
        material: ENGINEERING_MATERIALS[materialKey]
      });
    }
  }
  
  function updateObjectProperty(property, value) {
    if ($selectedObject) {
      sceneActions.updateObject($selectedObject.id, {
        [property]: value
      });
    }
  }
  
  function updateDocumentation(field, value) {
    if ($selectedObject) {
      sceneActions.updateObject($selectedObject.id, {
        documentation: {
          ...$selectedObject.documentation,
          [field]: value
        }
      });
    }
  }
  
  function updateGeometry(property, value, unit) {
    if ($selectedObject) {
      const numValue = parseFloat(value) || 0;
      sceneActions.updateObject($selectedObject.id, {
        geometry: {
          ...$selectedObject.geometry,
          [property]: numValue
        }
      });
    }
  }
  
  function updateTransform(type, axis, value) {
    if ($selectedObject) {
      const newTransform = {
        ...$selectedObject[type],
        [axis]: parseFloat(value) || 0
      };
      sceneActions.updateObject($selectedObject.id, {
        [type]: newTransform
      });
    }
  }
  
  function updateUnits(unit) {
    if ($selectedObject) {
      sceneActions.updateObject($selectedObject.id, {
        units: {
          ...$selectedObject.units,
          length: unit
        }
      });
    }
  }
  
  function deleteSelectedObject() {
    if ($selectedObject && confirm(`Delete ${$selectedObject.name}?`)) {
      sceneActions.removeObject($selectedObject.id);
    }
  }
  
  function formatValue(value, precision = 2) {
    return parseFloat(value).toFixed(precision);
  }
</script>

<div class="panel p-4 m-4 w-80 max-h-[600px] overflow-y-auto">
  <h3 class="text-lg font-semibold mb-4 text-gray-800">Engineering Objects</h3>
  
  <!-- Object List -->
  <div class="space-y-2 mb-4">
    {#each $sceneObjects as obj (obj.id)}
      <div 
        class="p-2 rounded border cursor-pointer transition-colors {
          $selectedObject?.id === obj.id 
            ? 'bg-cad-primary text-white border-cad-primary' 
            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
        }"
        on:click={() => sceneActions.selectObject(obj.id)}
      >
        <div class="flex justify-between items-center">
          <div>
            <span class="text-sm font-medium">{obj.name}</span>
            <div class="text-xs opacity-75">
              {obj.documentation?.partNumber || 'No P/N'} | {obj.material?.name || 'No Material'}
            </div>
          </div>
          <span class="text-xs opacity-75">{obj.type}</span>
        </div>
      </div>
    {/each}
    
    {#if $sceneObjects.length === 0}
      <p class="text-gray-500 text-sm italic">No objects in scene</p>
    {/if}
  </div>
  
  <!-- Selected Object Properties -->
  {#if $selectedObject}
    <div class="border-t pt-4">
      <!-- Tab Navigation -->
      <div class="flex mb-3 border-b">
        <button 
          class="px-3 py-1 text-xs font-medium border-b-2 transition-colors {
            activeTab === 'properties' ? 'border-cad-primary text-cad-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }"
          on:click={() => activeTab = 'properties'}
        >
          Properties
        </button>
        <button 
          class="px-3 py-1 text-xs font-medium border-b-2 transition-colors {
            activeTab === 'documentation' ? 'border-cad-primary text-cad-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }"
          on:click={() => activeTab = 'documentation'}
        >
          Documentation
        </button>
        <button 
          class="px-3 py-1 text-xs font-medium border-b-2 transition-colors {
            activeTab === 'materials' ? 'border-cad-primary text-cad-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }"
          on:click={() => activeTab = 'materials'}
        >
          Materials
        </button>
      </div>
      
      {#if activeTab === 'properties'}
        <!-- Object Name -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Name</label>
          <input 
            type="text" 
            value={$selectedObject.name}
            on:input={(e) => updateObjectProperty('name', e.target.value)}
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
          />
        </div>
        
        <!-- Units Selection -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Units</label>
          <select 
            value={$selectedObject.units?.length || 'cm'}
            on:change={(e) => updateUnits(e.target.value)}
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
          >
            {#each Object.entries(UNITS.LENGTH) as [key, unit]}
              <option value={key}>{unit.name} ({unit.symbol})</option>
            {/each}
          </select>
        </div>
        
        <!-- Dimensions -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Dimensions ({$selectedObject.units?.length || 'cm'})
          </label>
          {#if $selectedObject.type === 'cube'}
            <div class="grid grid-cols-3 gap-1">
              <input 
                type="number" 
                step="0.1"
                value={$selectedObject.geometry.width}
                on:input={(e) => updateGeometry('width', e.target.value)}
                class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
                placeholder="Width"
              />
              <input 
                type="number" 
                step="0.1"
                value={$selectedObject.geometry.height}
                on:input={(e) => updateGeometry('height', e.target.value)}
                class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
                placeholder="Height"
              />
              <input 
                type="number" 
                step="0.1"
                value={$selectedObject.geometry.depth}
                on:input={(e) => updateGeometry('depth', e.target.value)}
                class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
                placeholder="Depth"
              />
            </div>
          {:else if $selectedObject.type === 'sphere'}
            <input 
              type="number" 
              step="0.1"
              value={$selectedObject.geometry.radius}
              on:input={(e) => updateGeometry('radius', e.target.value)}
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
              placeholder="Radius"
            />
          {:else if $selectedObject.type === 'cylinder'}
            <div class="grid grid-cols-2 gap-1 mb-1">
              <input 
                type="number" 
                step="0.1"
                value={$selectedObject.geometry.radiusTop}
                on:input={(e) => updateGeometry('radiusTop', e.target.value)}
                class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
                placeholder="Top Radius"
              />
              <input 
                type="number" 
                step="0.1"
                value={$selectedObject.geometry.radiusBottom}
                on:input={(e) => updateGeometry('radiusBottom', e.target.value)}
                class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
                placeholder="Bottom Radius"
              />
            </div>
            <input 
              type="number" 
              step="0.1"
              value={$selectedObject.geometry.height}
              on:input={(e) => updateGeometry('height', e.target.value)}
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
              placeholder="Height"
            />
          {/if}
        </div>
        
        <!-- Engineering Properties -->
        <div class="mb-3 p-2 bg-gray-50 rounded">
          <h5 class="text-xs font-medium text-gray-700 mb-2">Calculated Properties</h5>
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span>Volume:</span>
              <span>{formatValue($selectedObject.properties?.volume || 0, 6)} m³</span>
            </div>
            <div class="flex justify-between">
              <span>Mass:</span>
              <span>{formatValue($selectedObject.properties?.mass || 0, 3)} kg</span>
            </div>
            <div class="flex justify-between">
              <span>Est. Cost:</span>
              <span>${formatValue($selectedObject.properties?.cost || 0, 2)}</span>
            </div>
          </div>
        </div>
        
        <!-- Position Controls -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Position ({$selectedObject.units?.length || 'cm'})</label>
          <div class="grid grid-cols-3 gap-1">
            <input 
              type="number" 
              step="0.1"
              value={$selectedObject.position.x}
              on:input={(e) => updateTransform('position', 'x', e.target.value)}
              class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
              placeholder="X"
            />
            <input 
              type="number" 
              step="0.1"
              value={$selectedObject.position.y}
              on:input={(e) => updateTransform('position', 'y', e.target.value)}
              class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
              placeholder="Y"
            />
            <input 
              type="number" 
              step="0.1"
              value={$selectedObject.position.z}
              on:input={(e) => updateTransform('position', 'z', e.target.value)}
              class="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
              placeholder="Z"
            />
          </div>
        </div>
        
      {:else if activeTab === 'documentation'}
        <!-- Part Number -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Part Number</label>
          <input 
            type="text" 
            value={$selectedObject.documentation?.partNumber || ''}
            on:input={(e) => updateDocumentation('partNumber', e.target.value)}
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
          />
        </div>
        
        <!-- Revision -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Revision</label>
          <input 
            type="text" 
            value={$selectedObject.documentation?.revision || ''}
            on:input={(e) => updateDocumentation('revision', e.target.value)}
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
          />
        </div>
        
        <!-- Designer -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Designer</label>
          <input 
            type="text" 
            value={$selectedObject.documentation?.designer || ''}
            on:input={(e) => updateDocumentation('designer', e.target.value)}
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary"
          />
        </div>
        
        <!-- Specifications -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Specifications</label>
          <textarea 
            value={$selectedObject.documentation?.specifications || ''}
            on:input={(e) => updateDocumentation('specifications', e.target.value)}
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary h-20 resize-none"
            placeholder="Technical specifications, tolerances, standards..."
          ></textarea>
        </div>
        
        <!-- Notes -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Engineering Notes</label>
          <textarea 
            value={$selectedObject.documentation?.notes || ''}
            on:input={(e) => updateDocumentation('notes', e.target.value)}
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cad-primary h-24 resize-none"
            placeholder="Design notes, manufacturing instructions, assembly notes..."
          ></textarea>
        </div>
        
      {:else if activeTab === 'materials'}
        <!-- Material Selection -->
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Material</label>
          <div class="grid grid-cols-2 gap-2">
            {#each Object.entries(ENGINEERING_MATERIALS) as [key, material]}
              <button 
                class="p-2 text-xs border rounded transition-colors {
                  $selectedObject.material?.name === material.name 
                    ? 'bg-cad-primary text-white border-cad-primary' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }"
                on:click={() => applyMaterialPreset(key)}
              >
                <div class="w-4 h-4 rounded mx-auto mb-1" style="background-color: {material.color}"></div>
                {material.name}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Material Properties -->
        {#if $selectedObject.material}
          <div class="p-2 bg-gray-50 rounded">
            <h5 class="text-xs font-medium text-gray-700 mb-2">Material Properties</h5>
            <div class="text-xs space-y-1">
              <div class="flex justify-between">
                <span>Density:</span>
                <span>{$selectedObject.material.density} kg/m³</span>
              </div>
              {#if $selectedObject.material.youngsModulus}
                <div class="flex justify-between">
                  <span>Young's Modulus:</span>
                  <span>{$selectedObject.material.youngsModulus.toLocaleString()} MPa</span>
                </div>
              {/if}
              {#if $selectedObject.material.yieldStrength}
                <div class="flex justify-between">
                  <span>Yield Strength:</span>
                  <span>{$selectedObject.material.yieldStrength} MPa</span>
                </div>
              {/if}
              {#if $selectedObject.material.compressiveStrength}
                <div class="flex justify-between">
                  <span>Compressive Strength:</span>
                  <span>{$selectedObject.material.compressiveStrength} MPa</span>
                </div>
              {/if}
              <div class="flex justify-between">
                <span>Thermal Conductivity:</span>
                <span>{$selectedObject.material.thermalConductivity} W/m·K</span>
              </div>
              <div class="flex justify-between">
                <span>Cost:</span>
                <span>${$selectedObject.material.cost}/kg</span>
              </div>
            </div>
          </div>
        {/if}
      {/if}
      
      <!-- Delete Button -->
      <button 
        on:click={deleteSelectedObject}
        class="w-full mt-4 btn-secondary bg-red-600 hover:bg-red-700 text-sm"
      >
        🗑️ Delete Object
      </button>
    </div>
  {:else}
    <p class="text-gray-500 text-sm italic">Select an object to edit properties</p>
  {/if}
</div>