<script>
  import Canvas from '$lib/components/Canvas.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import ObjectPanel from '$lib/components/ObjectPanel.svelte';
  import EditModePanel from '$lib/components/EditModePanel.svelte';
  import { editMode } from '$lib/stores/sceneStore.js';
</script>

<svelte:head>
  <title>3D CAD Design Tool</title>
  <meta name="description" content="Browser-based 3D CAD design tool with advanced modeling" />
</svelte:head>

<div class="h-screen flex flex-col bg-cad-bg">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200 px-4 py-2">
    <h1 class="text-xl font-bold text-gray-800">3D CAD Design Tool</h1>
  </header>
  
  <!-- Toolbar -->
  <Toolbar />
  
  <!-- Main Content Area -->
  <div class="flex-1 flex overflow-hidden">
    <!-- 3D Canvas -->
    <div class="flex-1">
      <Canvas />
    </div>
    
    <!-- Side Panel -->
    <div class="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <ObjectPanel />
      {#if $editMode === 'edit'}
        <EditModePanel />
      {/if}
    </div>
  </div>
  
  <!-- Footer -->
  <footer class="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
    <div class="flex justify-between items-center">
      <span>3D CAD Tool v1.0 - Advanced Modeling</span>
      <span>
        {$editMode === 'edit' ? 'Edit Mode: Click faces to select' : 'Object Mode: Click objects to select'}
      </span>
    </div>
  </footer>
</div>
