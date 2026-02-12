console.log('script.js загружен!');

    let gameState = {
    playerName: "",
    currentScene: "askName",
    inventory: [],
    fear: 0,
    health: 100,
    visitedScenes: new Set(),
    endingsFound: [],
    steps: 0,

    hasFlashlight: false,
    hasLibraryKey: false,
    hasCellarKey: false,
    ghostTalked: false,
    secretDoorFound: false,

    locations: {
        "комната": { visited: false, current: false },
        "коридор": { visited: false, current: false },
        "прихожая": { visited: false, current: false },
        "библиотека": { visited: false, current: false },
        "гостиная": { visited: false, current: false },
        "лестница": { visited: false, current: false },
        "второй этаж": { visited: false, current: false },
        "детская": { visited: false, current: false },
        "спальня": { visited: false, current: false },
        "ванная": { visited: false, current: false },
        "чердак": { visited: false, current: false },
        "подвал": { visited: false, current: false },
        "сад": { visited: false, current: false },
        "тайная комната": { visited: false, current: false }
    }
};

let isTyping = false;
let typewriterSpeed = 20;
let currentChoices = [];
let gameAutoSave = false;
let endingShown = false;

function saveGame() {
    try {
        const saveData = JSON.stringify({
            ...gameState,
            visitedScenes: Array.from(gameState.visitedScenes)
        });
        localStorage.setItem('mansionMysterySave', saveData);
        showMessage("✓ Игра сохранена!", "text-success");
        return true;
    } catch (e) {
        console.error("Ошибка сохранения:", e);
        showMessage("✗ Ошибка сохранения", "text-danger");
        return false;
    }
}

function loadGame() {
    try {
        const saveData = localStorage.getItem('mansionMysterySave');
        if (saveData) {
            const loaded = JSON.parse(saveData);
            loaded.visitedScenes = new Set(loaded.visitedScenes);
            
            if (!loaded.steps) loaded.steps = 0;
            
            gameState = loaded;
            
            updateStats();
            updateInventory();
            updateMap();
            
            showMessage(`✓ Игра загружена. Добро пожаловать, ${gameState.playerName}!`, "text-success");
            
            return true;
        } else {
            showMessage("✗ Сохранение не найдено", "text-warning");
            return false;
        }
    } catch (e) {
        console.error("Ошибка загрузки:", e);
        showMessage("✗ Ошибка загрузки сохранения", "text-danger");
        return false;
    }
}

function loadGameFromMenu() {
    if (loadGame()) {
        document.getElementById('menu-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        setTimeout(() => {
            loadScene(gameState.currentScene);
        }, 500);
    } else {
        alert("Не найдено сохраненной игры. Начните новую игру.");
    }
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
}

async function typeText(text, className = '') {
    if (!text) return;
    
    isTyping = true;
    const output = document.getElementById('output');
    const line = document.createElement('div');
    if (className) line.className = className;
    output.appendChild(line);
    
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    line.appendChild(cursor);
    
    for (let i = 0; i < text.length; i++) {
        if (!isTyping) {
            line.removeChild(cursor);
            line.textContent = text;
            break;
        }
        
        const char = text.charAt(i);
        if (char === '\n') {
            line.appendChild(document.createElement('br'));
        } else {
            line.insertBefore(document.createTextNode(char), cursor);
        }
        
        output.scrollTop = output.scrollHeight;
        await sleep(typewriterSpeed + Math.random() * 10);
    }
    
    line.removeChild(cursor);
    isTyping = false;
}

function showMessage(text, className = '') {
    const output = document.getElementById('output');
    const message = document.createElement('div');
    message.className = `fade-in ${className}`;
    message.textContent = text;
    output.appendChild(message);
    output.scrollTop = output.scrollHeight;
}

function skipTyping() {
    isTyping = false;
}

function showChoices(choices) {
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    currentChoices = choices;
    
    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn slide-in';
        button.style.animationDelay = `${index * 0.1}s`;
        button.textContent = `${index + 1}. ${choice.text}`;
        button.onclick = () => selectChoice(index);
        choicesDiv.appendChild(button);
    });
    
    document.getElementById('input-area').style.display = 'none';
    document.getElementById('continue-area').style.display = 'none';
}

function showInput(placeholder = 'Введите текст...') {
    document.getElementById('player-input').placeholder = placeholder;
    document.getElementById('input-area').style.display = 'flex';
    document.getElementById('choices').innerHTML = '';
    document.getElementById('continue-area').style.display = 'none';
    document.getElementById('player-input').focus();
}

function showContinue() {
    document.getElementById('input-area').style.display = 'none';
    document.getElementById('choices').innerHTML = '';
    document.getElementById('continue-area').style.display = 'flex';
}

function selectChoice(index) {
    if (isTyping) {
        skipTyping();
        return;
    }
    
    if (index >= 0 && index < currentChoices.length) {
        const choice = currentChoices[index];
        showMessage(`> ${choice.text}`, 'text-highlight');
        
        if (choice.action) {
            if (typeof choice.action === 'function') {
                choice.action();
            } else {
                loadScene(choice.action);
            }
        }
    }
}

function updateStats() {
    const playerNameElement = document.getElementById('player-name');
    
    if (!gameState.playerName || gameState.playerName.trim() === '') {
        playerNameElement.textContent = '???';
        playerNameElement.title = 'Имя не установлено';
    } else {
        playerNameElement.title = gameState.playerName;
        if (gameState.playerName.length > 15) {
            playerNameElement.textContent = gameState.playerName.substring(0, 12) + '...';
        } else {
            playerNameElement.textContent = gameState.playerName;
        }
    }
    
    document.getElementById('health-value').textContent = `${gameState.health}%`;
    document.getElementById('fear-value').textContent = `${gameState.fear}%`;
    
    document.getElementById('health-bar').style.width = `${gameState.health}%`;
    document.getElementById('fear-bar').style.width = `${gameState.fear}%`;

    const healthValue = document.getElementById('health-value');
    healthValue.className = 'stat-value';
    if (gameState.health > 70) {
        healthValue.classList.add('text-success');
    } else if (gameState.health > 30) {
        healthValue.classList.add('text-warning');
    } else {
        healthValue.classList.add('text-danger');
    }

    const fearValue = document.getElementById('fear-value');
    fearValue.className = 'stat-value';
    if (gameState.fear < 30) {
    } else if (gameState.fear < 60) {
        fearValue.classList.add('text-warning');
    } else {
        fearValue.classList.add('text-danger');
    }
}

function updateInventory() {
    const inventoryList = document.getElementById('inventory-list');
    const countElement = document.getElementById('inventory-count');
    
    if (gameState.inventory.length === 0) {
        inventoryList.innerHTML = '<div style="color:#555; font-style:italic; text-align:center; padding:20px;">Инвентарь пуст</div>';
        countElement.textContent = '0/20';
    } else {
        inventoryList.innerHTML = '';
        gameState.inventory.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item fade-in';
            itemDiv.textContent = item;
            inventoryList.appendChild(itemDiv);
        });
        countElement.textContent = `${gameState.inventory.length}/20`;
    }
}

function addToInventory(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
        updateInventory();
        
        if (item === "фонарик") gameState.hasFlashlight = true;
        if (item === "ключ от библиотеки") gameState.hasLibraryKey = true;
        if (item === "ключ от подвала") gameState.hasCellarKey = true;
        
        showMessage(`✓ Получен предмет: ${item}`, 'text-success');
        return true;
    }
    return false;
}

function updateMap() {
    const mapGrid = document.getElementById('map-grid');
    mapGrid.innerHTML = '';
    
    const locations = [
        { id: "комната", name: "КОМН." },
        { id: "коридор", name: "КОР." },
        { id: "прихожая", name: "ПРИХ." },
        { id: "библиотека", name: "БИБЛ." },
        { id: "гостиная", name: "ГОСТ." },
        { id: "лестница", name: "ЛЕСТ." },
        { id: "второй этаж", name: "2 ЭТ." },
        { id: "детская", name: "ДЕТ." },
        { id: "спальня", name: "СП." },
        { id: "ванная", name: "ВАН." },
        { id: "чердак", name: "ЧЕРД." },
        { id: "подвал", name: "ПОДВ." },
        { id: "сад", name: "САД" },
        { id: "тайная комната", name: "ТАЙН." }
    ];
    
    locations.forEach(loc => {
        const cell = document.createElement('div');
        cell.className = 'map-cell';
        cell.textContent = loc.name;
        cell.title = loc.id;
        
        if (gameState.locations[loc.id]) {
            if (gameState.locations[loc.id].visited) {
                cell.classList.add('visited');
            }
            if (gameState.locations[loc.id].current) {
                cell.classList.add('current');
            }
        }
        
        mapGrid.appendChild(cell);
    });
}

function setCurrentLocation(locationId) {
    Object.keys(gameState.locations).forEach(key => {
        gameState.locations[key].current = false;
    });
    
    if (gameState.locations[locationId]) {
        gameState.locations[locationId].current = true;
        gameState.locations[locationId].visited = true;
        gameState.steps++;
    }
    
    updateMap();
}

function toggleMap() {
    const map = document.getElementById('location-map');
    if (map.style.display === 'none' || map.style.display === '') {
        map.style.display = 'block';
    } else {
        map.style.display = 'none';
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(percent) {
    return Math.random() * 100 < percent;
}

function increaseFear(amount) {
    if (endingShown) return;
    
    gameState.fear = Math.min(100, gameState.fear + amount);
    updateStats();
    
    if (gameState.fear >= 100) {
        showEnding("БЕЗУМИЕ", "Страх полностью овладел вами. Вы теряете рассудок и становитесь еще одним призраком этого проклятого места.\n\nЭто финальная концовка. Игра завершена.");
    }
}

function decreaseHealth(amount) {
    if (endingShown) return;
    
    gameState.health = Math.max(0, gameState.health - amount);
    updateStats();
    
    if (gameState.health <= 0) {
        showEnding("СМЕРТЬ", "Вы погибаете в старом особняке. Ваше тело никогда не будет найдено.\n\nЭто финальная концовка. Игра завершена.");
    }
}

function loadScene(sceneName) {
    if (isTyping) {
        skipTyping();
        setTimeout(() => loadScene(sceneName), 100);
        return;
    }
    
    endingShown = false;
    
    gameState.currentScene = sceneName;
    
    if (gameAutoSave) saveGame();
    
    if (scenes[sceneName]) {
        scenes[sceneName]();
    } else {
        showMessage("Ошибка: сцена не найдена", "text-danger");
        loadScene("corridor");
    }
}

function showEnding(title, text) {
    endingShown = true;
    
    document.getElementById('ending-screen').style.display = 'flex';
    document.getElementById('ending-title').textContent = `КОНЕЦ: ${title}`;
    document.getElementById('ending-text').textContent = text;
    
    if (!gameState.endingsFound.includes(title)) {
        gameState.endingsFound.push(title);
    }
    
    const stats = `
        <div style="color:#8f8; margin-bottom:10px;">СТАТИСТИКА ИГРЫ:</div>
        <div>Игрок: <span style="color:#0f0">${gameState.playerName}</span></div>
        <div>Шагов сделано: <span style="color:#0f0">${gameState.steps}</span></div>
        <div>Уровень страха: <span style="color:#0f0">${gameState.fear}%</span></div>
        <div>Здоровье: <span style="color:#0f0">${gameState.health}%</span></div>
        <div>Собрано предметов: <span style="color:#0f0">${gameState.inventory.length}</span></div>
        <div>Найдено концовок: <span style="color:#0f0">${gameState.endingsFound.length}/8</span></div>
    `;
    
    document.getElementById('ending-stats').innerHTML = stats;
    
    const continueBtn = document.getElementById('continue-ending-btn');
    if (title === "БЕЗУМИЕ" || title === "СМЕРТЬ") {
        continueBtn.style.display = 'none';
    } else {
        continueBtn.style.display = 'inline-block';
    }
    
    saveGame();
}

function returnToMenu() {
    endingShown = false;
    document.getElementById('ending-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
}

function continueExploring() {
    endingShown = false;
    document.getElementById('ending-screen').style.display = 'none';
    loadScene("corridor");
}

function startNewGame() {
    console.log('startNewGame вызвана!');
    if (localStorage.getItem('mansionMysterySave') && !confirm("Начать новую игру? Текущее сохранение будет перезаписано.")) {
        return;
    }
    
    gameState = {
        playerName: "",
        currentScene: "askName",
        inventory: [],
        fear: 0,
        health: 100,
        steps: 0,
        visitedScenes: new Set(),
        endingsFound: [],
        hasFlashlight: false,
        hasLibraryKey: false,
        hasCellarKey: false,
        ghostTalked: false,
        secretDoorFound: false,
        locations: {
            "комната": { visited: false, current: false },
            "коридор": { visited: false, current: false },
            "прихожая": { visited: false, current: false },
            "библиотека": { visited: false, current: false },
            "гостиная": { visited: false, current: false },
            "лестница": { visited: false, current: false },
            "второй этаж": { visited: false, current: false },
            "детская": { visited: false, current: false },
            "спальня": { visited: false, current: false },
            "ванная": { visited: false, current: false },
            "чердак": { visited: false, current: false },
            "подвал": { visited: false, current: false },
            "сад": { visited: false, current: false },
            "тайная комната": { visited: false, current: false }
        }
    };
    
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    updateStats();
    updateInventory();
    updateMap();
    
    loadScene("askName");
}

function showMenu() {
    if (confirm("Вернуться в главное меню? Текущий прогресс будет сохранен.")) {
        saveGame();
        document.getElementById('menu-screen').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
    }
}

function showEndingsList() {
    const endings = [
        "ОСВОБОЖДЕНИЕ - Помочь призракам обрести покой",
        "ПОБЕГ - Найти выход из особняка",
        "БЕЗУМИЕ - Слишком высокий уровень страха",
        "НОВЫЙ ХОЗЯИН - Продолжить эксперименты алхимика",
        "ВЕЧНЫЙ УЗНИК - Остаться в особняке навсегда",
        "ГОРЬКАЯ ПРАВДА - Раскрыть тайну миру",
        "ДОБРОВОЛЬНАЯ ЖЕРТВА - Пожертвовать собой",
        "ВОЗРОЖДЕНИЕ - Обрести вечную жизнь"
    ];
    
    let foundText = "";
    endings.forEach((ending, index) => {
        const found = gameState.endingsFound.some(e => e === ending.split(" - ")[0]);
        foundText += `${index + 1}. ${ending} ${found ? "✓" : "✗"}\n`;
    });
    
    alert(`НАЙДЕННЫЕ КОНЦОВКИ:\n\nНайдено: ${gameState.endingsFound.length} из 8\n\n${foundText}\n✓ - найдено\n✗ - еще не найдено`);
}

function showInstructions() {
    alert("ПРАВИЛА ИГРЫ:\n• Кликайте по кнопкам для выбора действий\n• Следите за уровнем страха и здоровья\n• Собирайте предметы - они помогут в расследовании\n• Исследуйте все комнаты\n• Используйте клавиши 1-9 для быстрого выбора);
}

function showAbout() {
    alert("ОБ ИГРЕ:\n\n'Тайна старого особняка' - текстовая новелла в жанре хоррор.\n\nВы просыпаетесь в заброшенном особняке с мрачной историей. Ваша задача - исследовать дом, раскрыть его тайны и найти выход, стараясь сохранить рассудок и жизнь.\n\nОсобенности:\n• 8 уникальных концовок\n• Динамическая система страха\n• Интерактивный инвентарь и карта\n• Рабочая система сохранений\n• Минималистичный ретро-стиль\n\nИгра создана в стиле классических текстовых приключений с элементами психологического хоррора.");
}

function init() {
    console.log("Инициализация игры...");
    
    document.getElementById('submit-btn').addEventListener('click', function() {
        const input = document.getElementById('player-input');
        let value = input.value.trim();
        
        if (value) {
            if (value.length > 30) {
                value = value.substring(0, 30);
                showMessage("Имя сокращено до 30 символов", "text-warning");
            }
            
            showMessage(`> ${value}`, 'text-highlight');
            
            if (gameState.currentScene === "askName") {
                gameState.playerName = value;
                updateStats();
                document.getElementById('input-area').style.display = 'none';
                loadScene("intro");
            }
            
            input.value = '';
        }
    });
    
    document.getElementById('player-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('submit-btn').click();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            const buttons = document.getElementById('choices').getElementsByClassName('choice-btn');
            
            if (index < buttons.length && buttons[index]) {
                buttons[index].click();
            }
        }
        
        if ((e.key === ' ' || e.key === 'Enter') && 
            document.getElementById('continue-area').style.display !== 'none') {
            document.getElementById('continue-btn').click();
        }
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveGame();
        }
        
        if (e.key === 'm' || e.key === 'M') {
            toggleMap();
        }
        
        if (e.key === 'Escape') {
            showMenu();
        }
    });
    
    updateStats();
    updateInventory();
    updateMap();
    
    console.log("Инициализация завершена");
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Скрипт загружен, показываем меню');
    document.getElementById('menu-screen').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', init);
