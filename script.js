function loadScene(sceneName) {
    const initialScenes = ['askName', 'intro'];
    if (!initialScenes.includes(sceneName)) {
        saveGame();
    }
    // Remaining implementation of loadScene...
}