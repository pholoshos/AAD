<script>
  import { sceneObjects } from '../stores/sceneStore.js';
  import { exportToSTL, exportToOBJ, downloadFile } from '../utils/exportUtils.js';
  
  export let show = false;
  
  function exportSTL() {
    const stlContent = exportToSTL($sceneObjects);
    downloadFile(stlContent, 'model.stl', 'application/octet-stream');
    show = false;
  }
  
  function exportOBJ() {
    const objContent = exportToOBJ($sceneObjects);
    downloadFile(objContent, 'model.obj', 'text/plain');
    show = false;
  }
  
  function closeModal() {
    show = false;
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="panel p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4 text-gray-800">Export Model</h3>
      
      <p class="text-sm text-gray-600 mb-4">
        Choose the format to export your 3D model:
      </p>
      
      <div class="space-y-3 mb-6">
        <button 
          on:click={exportSTL}
          class="w-full btn-primary text-left flex items-center justify-between"
        >
          <span>
            <strong>STL Format</strong><br>
            <small class="opacity-75">Standard for 3D printing</small>
          </span>
          <span class="text-2xl">📄</span>
        </button>
        
        <button 
          on:click={exportOBJ}
          class="w-full btn-primary text-left flex items-center justify-between"
        >
          <span>
            <strong>OBJ Format</strong><br>
            <small class="opacity-75">Universal 3D model format</small>
          </span>
          <span class="text-2xl">📦</span>
        </button>
      </div>
      
      <div class="flex justify-end">
        <button on:click={closeModal} class="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}