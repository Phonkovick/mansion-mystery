// script.js

function loadScene(sceneName) {
    // Existing code...

    // Modify autosave condition
    if (gameAutoSave && sceneName !== 'askName' && sceneName !== 'intro') {
        autoSave();
    }

    // Existing code...
}