document.addEventListener('DOMContentLoaded', function() {
    // אלמנטים בדף
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const numFieldsForm = document.getElementById('numFieldsForm');
    const textFieldsForm = document.getElementById('textFieldsForm');
    const textFieldsContainer = document.getElementById('textFields');
    const gameItemsContainer = document.getElementById('gameItems');
    const gameInfoContainer = document.getElementById('gameInfo');
    const checkBtn = document.getElementById('checkBtn');
    const resetBtn = document.getElementById('resetBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const feedback = document.getElementById('feedback');
    
    // מידע המשחק
    let gameData = {
        gameName: '',
        numFields: 0,
        textValues: [],
        checkedIndices: [],
        selectedIndices: [],
        gameId: null
    };
    
    // אירוע לטופס בחירת מספר השדות
    numFieldsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        gameData.gameName = document.getElementById('gameName').value;
        gameData.numFields = parseInt(document.getElementById('numFields').value);
        
        // בדיקת תקינות הנתונים
        if (!gameData.gameName.trim()) {
            alert('נא להזין שם למשחק');
            return;
        }
        
        // יצירת שדות הטקסט והצ'ק בוקסים
        createTextFields(gameData.numFields);
        
        // מעבר לשלב 2
        step1.classList.remove('active');
        step2.classList.add('active');
    });
    
    // אירוע לטופס הטקסט והצ'ק בוקסים
    textFieldsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // איסוף הנתונים מהטופס
        gameData.textValues = [];
        gameData.checkedIndices = [];
        
        for (let i = 1; i <= gameData.numFields; i++) {
            const textField = document.getElementById(`textField${i}`);
            const checkbox = document.getElementById(`checkbox${i}`);
            
            gameData.textValues.push(textField.value);
            
            if (checkbox.checked) {
                gameData.checkedIndices.push(i - 1); // שמירת האינדקס (0-based)
            }
        }
        
        // ודא שיש לפחות פריט אחד מסומן
        if (gameData.checkedIndices.length === 0) {
            alert('נא לסמן לפחות פריט אחד שיש לזכור');
            return;
        }
        
        // שליחת הנתונים לשרת ויצירת המשחק
        saveGame(gameData);
    });
    
    // פונקציה ליצירת שדות הטקסט והצ'ק בוקסים
    function createTextFields(numFields) {
        textFieldsContainer.innerHTML = '';
        
        for (let i = 1; i <= numFields; i++) {
            const row = document.createElement('div');
            row.className = 'text-field-row';
            
            const label = document.createElement('label');
            label.htmlFor = `textField${i}`;
            label.textContent = `פריט ${i}:`;
            
            const textField = document.createElement('input');
            textField.type = 'text';
            textField.id = `textField${i}`;
            textField.name = `text${i}`;
            textField.required = true;
            
            const checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = `checkbox${i}`;
            checkboxLabel.textContent = 'לזכור';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox${i}`;
            checkbox.name = `is_checked${i}`;
            checkbox.value = "1"; // כשהצ'ק בוקס מסומן, הערך יהיה 1
            
            row.appendChild(label);
            row.appendChild(textField);
            row.appendChild(checkbox);
            row.appendChild(checkboxLabel);
            
            textFieldsContainer.appendChild(row);
        }
    }
    
    // פונקציה לשמירת המשחק
    function saveGame(gameData) {
        // יצירת מזהה ייחודי למשחק
        const gameId = db.collection("games").doc().id;
        
        // הכנת אובייקט המשחק לטבלת t1
        const t1Data = {
            name: gameData.gameName,
            link: `game_${gameId}`,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // הכנת אובייקט המשחק לטבלת game
        const gameItemData = {
            id_game: gameId,
            num: gameData.numFields
        };
        
        // הוספת הטקסטים והסימונים
        for (let i = 1; i <= gameData.numFields; i++) {
            const textField = document.getElementById(`textField${i}`);
            const checkbox = document.getElementById(`checkbox${i}`);
            
            gameItemData[`text${i}`] = textField.value;
            gameItemData[`is_checked${i}`] = checkbox.checked ? 1 : 0;
        }
        
        // שמירת הנתונים בפיירבייס
        Promise.all([
            db.collection("t1").doc(gameId).set(t1Data),
            db.collection("game").doc(gameId).set(gameItemData)
        ])
        .then(() => {
            gameData.gameId = gameId;
            
            // יצירת פריטי המשחק
            createGameItems(gameData);
            
            // הצגת מידע על המשחק
            displayGameInfo(gameData);
            
            // מעבר לשלב 3
            step2.classList.remove('active');
            step3.classList.add('active');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('אירעה שגיאה בשמירת המשחק. אנא נסה שוב.');
        });
    }
    
    // פונקציה להצגת מידע על המשחק
    function displayGameInfo(gameData) {
        const gameUrl = `game_play.html?id=${gameData.gameId}`;
        const fullPath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const fullUrl = `${fullPath}${gameUrl}`;
        
        gameInfoContainer.innerHTML = `
            <div class="game-info-content">
                <h3>${gameData.gameName}</h3>
                <p>מספר פריטים: ${gameData.numFields}</p>
                <p>קישור למשחק: <a href="${gameUrl}" target="_blank">${fullUrl}</a></p>
            </div>
        `;
    }
    
    // פונקציה ליצירת פריטי המשחק
    function createGameItems(gameData) {
        gameItemsContainer.innerHTML = '';
        gameData.selectedIndices = [];
        
        // יצירת סדר אקראי של הפריטים
        const indices = [...Array(gameData.numFields).keys()];
        shuffleArray(indices);
        
        // יצירת הפריטים בסדר אקראי
        indices.forEach(index => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';
            gameItem.textContent = gameData.textValues[index];
            gameItem.dataset.index = index;
            
            // אירוע לחיצה על פריט
            gameItem.addEventListener('click', function() {
                this.classList.toggle('selected');
                
                const itemIndex = parseInt(this.dataset.index);
                const selectedIndex = gameData.selectedIndices.indexOf(itemIndex);
                
                if (selectedIndex === -1) {
                    // הוספת הפריט לרשימת הנבחרים
                    gameData.selectedIndices.push(itemIndex);
                } else {
                    // הסרת הפריט מרשימת הנבחרים
                    gameData.selectedIndices.splice(selectedIndex, 1);
                }
            });
            
            gameItemsContainer.appendChild(gameItem);
        });
    }
    
    // אירוע לכפתור הבדיקה
    checkBtn.addEventListener('click', function() {
        // בדיקה אם הפריטים שנבחרו תואמים לאלה שיש לזכור
        const correctIndices = [...gameData.checkedIndices].sort((a, b) => a - b);
        const selectedIndices = [...gameData.selectedIndices].sort((a, b) => a - b);
        
        let isCorrect = true;
        
        if (correctIndices.length !== selectedIndices.length) {
            isCorrect = false;
        } else {
            for (let i = 0; i < correctIndices.length; i++) {
                if (correctIndices[i] !== selectedIndices[i]) {
                    isCorrect = false;
                    break;
                }
            }
        }
        
        // הצגת המשוב
        if (isCorrect) {
            feedback.textContent = 'כל הכבוד! בחרת נכון את כל הפריטים.';
            feedback.className = 'feedback success';
        } else {
            feedback.textContent = 'לא נורא, נסה שנית.';
            feedback.className = 'feedback error';
        }
        
        // הצגת כפתורי המשחק
        checkBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';
        newGameBtn.style.display = 'inline-block';
    });
    
    // אירוע לכפתור האיפוס
    resetBtn.addEventListener('click', function() {
        // איפוס הבחירות
        const gameItems = document.querySelectorAll('.game-item');
        gameItems.forEach(item => {
            item.classList.remove('selected');
        });
        
        gameData.selectedIndices = [];
        feedback.textContent = '';
        feedback.className = 'feedback';
        
        // הסתרת כפתורי המשחק והצגת כפתור הבדיקה
        resetBtn.style.display = 'none';
        newGameBtn.style.display = 'none';
        checkBtn.style.display = 'inline-block';
    });
    
    // אירוע לכפתור משחק חדש
    newGameBtn.addEventListener('click', function() {
        // חזרה לשלב 1
        step3.classList.remove('active');
        step1.classList.add('active');
        
        // איפוס הנתונים
        gameData = {
            gameName: '',
            numFields: 0,
            textValues: [],
            checkedIndices: [],
            selectedIndices: [],
            gameId: null
        };
        
        // איפוס שדות הטופס
        document.getElementById('gameName').value = '';
        
        feedback.textContent = '';
        feedback.className = 'feedback';
        
        // הסתרת כפתורי המשחק והצגת כפתור הבדיקה
        resetBtn.style.display = 'none';
        newGameBtn.style.display = 'none';
        checkBtn.style.display = 'inline-block';
    });
    
    // פונקציה לערבוב מערך
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});