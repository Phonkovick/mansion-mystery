// Complete JavaScript code goes here

function loadScene(sceneName) {
    // Updated condition to skip autosave for 'askName' and 'intro' scenes
    if (gameAutoSave && sceneName !== 'askName' && sceneName !== 'intro') saveGame();
    // Rest of the loadScene function implementation
}
// ... rest of the script.js functionality ...