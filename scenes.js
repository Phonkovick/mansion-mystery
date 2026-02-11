const scenes = {
    "askName": async function() {
        clearOutput();
        await typeText("Добро пожаловать в 'Тайну старого особняка'.", "text-highlight");
        await typeText("Как вас зовут? (введите имя)");
        showInput("Введите ваше имя...");
    },

    "intro": async function() {
        clearOutput();
        setCurrentLocation("комната");
        await typeText(`${gameState.playerName}, вы просыпаетесь в незнакомой комнате...`, "text-highlight");
        await typeText("\nПоследнее, что помнится - вы зашли в заброшенный особняк на вечеринку.");
        await typeText("Теперь вы один, а за окном бушует гроза.");
        await typeText("Молнии на мгновение освещают интерьер комнаты.");
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("room");
    },

    "room": async function() {
        clearOutput();
        await typeText("Вы встаете с кровати. Комната обставлена старинной мебелью.", "text-highlight");
        await typeText("Дверь в коридор приоткрыта. Оттуда доносится скрип половиц.");
        await typeText("На столе - опрокинутая свеча, воск застыл на дереве.");
        showChoices([
            { text: "Осмотреть комнату", action: "examineRoom" },
            { text: "Подойти к окну", action: "lookWindow" },
            { text: "Проверить карманы", action: "checkPockets" },
            { text: "Выйти в коридор", action: "corridor" }
        ]);
    },
    
    "examineRoom": async function() {
        clearOutput();
        
        await typeText("Вы осматриваете комнату:", "text-highlight");
        await typeText("- Кровать с балдахином, покрытая пылью");
        await typeText("- Старинный комод с выдвижными ящиками");
        await typeText("- Туалетный столик с треснувшим зеркалом");
        await typeText("- Шкаф для одежды");
        await typeText("- Камин с засохшей золой");
        
        if (!gameState.hasFlashlight) {
            await typeText("\nВ одном из ящиков комода вы находите старый, но рабочий фонарик!", "text-success");
            addToInventory("фонарик");
        } else {
            await typeText("\nБольше ничего полезного здесь нет.");
        }
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("room");
    },
    
    "lookWindow": async function() {
        clearOutput();
        
        await typeText("Вы подходите к окну. Стекло покрыто трещинами.", "text-highlight");
        await typeText("За окном - заброшенный сад. На подоконнике лежит пожелтевший листок.");
        
        showChoices([
            { text: "Прочитать записку", action: "readNote" },
            { text: "Попытаться открыть окно", action: "tryWindow" },
            { text: "Вернуться", action: "room" }
        ]);
    },
    
    "readNote": async function() {
        clearOutput();
        increaseFear(10);
        
        await typeText("На листке кривым почерком написано:", "text-highlight");
        await typeText("\"Они не ушли. Они ждут. Особенно дети. Они все еще играют.\"", "text-warning");
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("room");
    },
    
    "tryWindow": async function() {
        clearOutput();
        
        await typeText("Вы пытаетесь открыть окно, но оно заклинило.", "text-highlight");
        await typeText("Не открывается.");
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("room");
    },
    
    "checkPockets": async function() {
        clearOutput();
        
        await typeText("Вы проверяете карманы:", "text-highlight");
        await typeText("- Мобильный телефон (нет сигнала)");
        await typeText("- Ключи от своей квартиры");
        await typeText("- Кусочек мела");
        await typeText("- Зажигалка");
        
        addToInventory("зажигалка");
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("room");
    },
    
    "corridor": async function() {
        clearOutput();
        setCurrentLocation("коридор");
        
        await typeText("Вы выходите в длинный темный коридор.", "text-highlight");
        await typeText("Старые обои облезли, пол скрипит под ногами.");
        await typeText("В воздухе витает запах сырости и старого дерева.");
        
        if (gameState.fear > 30) {
            await typeText("\nВам кажется, что в конце коридора мелькнула тень...", "text-warning");
            increaseFear(5);
        }
        
        if (!gameState.ghostTalked && chance(20)) {
            gameState.ghostTalked = true;
            setTimeout(() => {
                loadScene("ghostAppears");
            }, 1500);
            return;
        }
        
        const choices = [
            { text: "Пойти налево (лестница)", action: "stairs" },
            { text: "Пойти направо (библиотека)", action: "libraryDoor" },
            { text: "Пойти прямо (гостиная)", action: "livingRoom" },
            { text: "Осмотреть прихожую", action: "entranceHall" }
        ];
        
        if (gameState.hasCellarKey) {
            choices.push({ text: "Спуститься в подвал", action: "cellar" });
        }
        
        showChoices(choices);
    },
    
    "ghostAppears": async function() {
        clearOutput();
        increaseFear(30);
        
        await typeText("Внезапно перед вами материализуется полупрозрачная фигура!", "text-danger");
        await typeText("Призрак медленно плывет в вашу сторону...", "text-warning");
        
        const choices = [
            { text: "Попытаться заговорить с призраком", action: "talkGhost" },
            { text: "Бежать без оглядки", action: "runFromGhost" }
        ];
        
        if (gameState.hasFlashlight) {
            choices.push({ text: "Осветить фонариком", action: "flashlightGhost" });
        }
        
        showChoices(choices);
    },
    
    "talkGhost": async function() {
        clearOutput();
        await typeText("Вы дрожащим голосом спрашиваете: 'Что ты хочешь?'", "text-highlight");
        await typeText("\nПризрак останавливается. Его голос звучит прямо в вашей голове:");
        await typeText("'Найди мое кольцо... в саду... под розой...'", "text-secret");
        await typeText("\nЗатем призрак исчезает.");
        
        addToInventory("задание: найти кольцо");
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("corridor");
    },
    
    "runFromGhost": async function() {
        clearOutput();
        increaseFear(20);
        
        await typeText("Вы разворачиваетесь и бежите без оглядки!", "text-danger");
        await typeText("Сердце колотится, в ушах звон.");
        await typeText("Спустя несколько минут, вы останавливаетесь, чтобы отдышаться.");
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("corridor");
    },
    
    "flashlightGhost": async function() {
        clearOutput();
        
        await typeText("Вы направляете фонарик на призрака.", "text-highlight");
        await typeText("Свет проходит сквозь него, но призрак морщится и отступает.");
        await typeText("Он медленно растворяется в воздухе, оставляя после себя ледяной холод.");
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("corridor");
    },
    
    "stairs": async function() {
        clearOutput();
        setCurrentLocation("лестница");
        
        await typeText("Вы подходите к лестнице, ведущей на второй этаж.", "text-highlight");
        await typeText("Деревянные ступени скрипят под ногами.");
        await typeText("Сверху доносится тихий шепот.");
        
        showChoices([
            { text: "Подняться на второй этаж", action: "secondFloor" },
            { text: "Вернуться в коридор", action: "corridor" }
        ]);
    },
    
    "secondFloor": async function() {
        clearOutput();
        setCurrentLocation("второй этаж");
        
        await typeText("Вы оказываетесь на втором этаже.", "text-highlight");
        await typeText("Здесь еще темнее, чем внизу. В воздухе пахнет плесенью.");
        await typeText("Перед вами несколько дверей.");
        
        showChoices([
            { text: "Дверь слева (детская)", action: "nursery" },
            { text: "Дверь в центре (спальня)", action: "bedroom" },
            { text: "Дверь справа (ванная)", action: "bathroom" },
            { text: "Вернуться вниз", action: "stairs" }
        ]);
    },
    
    "libraryDoor": async function() {
        clearOutput();
        
        await typeText("Вы подходите к двери в библиотеку.", "text-highlight");
        await typeText("Дверь заперта. На двери табличка: 'Библиотека'.");
        
        if (gameState.hasLibraryKey) {
            showChoices([
                { text: "Открыть дверь ключом", action: "library" },
                { text: "Вернуться", action: "corridor" }
            ]);
        } else {
            await typeText("Кажется, нужен ключ.", "text-warning");
            
            showChoices([
                { text: "Вернуться", action: "corridor" }
            ]);
        }
    },
    
    "livingRoom": async function() {
        clearOutput();
        setCurrentLocation("гостиная");
        
        await typeText("Вы входите в просторную гостиную.", "text-highlight");
        await typeText("Большой камин, запыленная мебель, на столе разложены карты.");
        await typeText("На каминной полке стоит фотография семьи.");
        
        showChoices([
            { text: "Осмотреть фотографию", action: "examinePhoto" },
            { text: "Посмотреть на карты", action: "examineCards" },
            { text: "Осмотреть камин", action: "examineFireplace" },
            { text: "Вернуться в коридор", action: "corridor" }
        ]);
    },
    
    "entranceHall": async function() {
        clearOutput();
        setCurrentLocation("прихожая");
        
        await typeText("Вы в просторной прихожей.", "text-highlight");
        await typeText("Большая дверь на улицу заперта на тяжелый замок.");
        await typeText("На вешалке висят старые пальто.");
        
        showChoices([
            { text: "Попробовать открыть дверь", action: "tryMainDoor" },
            { text: "Осмотреть вешалку", action: "examineCoatRack" },
            { text: "Вернуться в коридор", action: "corridor" }
        ]);
    },
    
    "tryMainDoor": async function() {
        clearOutput();
        
        await typeText("Вы пытаетесь открыть главную дверь, но она не поддается.", "text-highlight");
        await typeText("Замок ржавый и заклинило. Без ключа не открыть.");
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("entranceHall");
    },
    
    "examineCoatRack": async function() {
        clearOutput();
        
        await typeText("Вы осматриваете пальто на вешалке.", "text-highlight");
        
        if (!gameState.hasLibraryKey && chance(50)) {
            await typeText("\nВ кармане одного из пальто вы находите ключ!", "text-success");
            addToInventory("ключ от библиотеки");
        } else {
            await typeText("\nВ карманах ничего полезного.");
        }
        
        showContinue();
        document.getElementById('continue-btn').onclick = () => loadScene("entranceHall");
    }

window.scenes = scenes;
