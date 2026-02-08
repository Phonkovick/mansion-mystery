function loadScene(scene) {
    // Check if the scene is 'askName' or 'intro', skip autosaving for these scenes
    if (scene === 'askName' || scene === 'intro') {
        // Load the scene without autosaving 
        // Original logic to load the scene
        console.log('Loading scene:', scene);
        // Additional logic for loading scenes
    } else {
        // Autosave logic can go here
        autosave();
        // Load the scene
        console.log('Loading scene:', scene);
        // Additional logic for loading scenes
    }
}