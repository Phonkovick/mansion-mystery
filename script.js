// Modified loadScene function
function loadScene(scene) {
    if (scene === 'askName' || scene === 'intro') {
        // Skip autosaving for these initial scenes
        console.log(`Loading scene: ${scene}, autosave skipped.`);
    } else {
        // Existing autosaving logic here
        autosave();
    }
    // Load the scene logic here
}

// Other existing code...