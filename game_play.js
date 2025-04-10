document.addEventListener('DOMContentLoaded', function() {
    // קבלת מזהה המשחק מה-URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    if (!gameId) {
        alert('חסר מזהה משחק!');
        return;
    }
    
    // אלמנטים בדף
    const gameItemsContainer = document.querySelector('.game-items-container');
    const checkBtn = document.getElementById('checkBtn');
    const resetBtn = document.getElementById('resetBtn');
    const feedback = document.getElementById('feedback');
    
    // מידע המשחק
    const gameData = {
        checkedIndices: [],
        selectedIndices: []
    };
    
    // טעינת המשחק מפיירבייס
    loadGame(gameId);
    
    // פונקציה לטעינת המשחק
    function loadGame(gameId) {
        // קבלת נתוני המשחק
        Promise.all([
            db.collection("t1").doc(gameId).get(),
            db.collection("game").doc(gameId).get()
        ])
        .then(([t1Doc, gameDoc]) => {
            if (!t1Doc.exists || !gameDoc.exists) {
                throw new Error("המשחק המבוקש לא נמצא");
            }
            
            const t1Data = t1Doc.data();
            const gameData = gameDoc.data();
            
            // הצגת שם המשחק
            document.title = `${t1Data.name} - משחק זיכרון`;
            document.querySelector('h1').textContent = t1Data.name;
            
            // איסוף פריטי המשחק והסימונים
            const gameItems = [];
            const numItems = gameData.num;
            
            for (let i = 1; i <= numItems; i++) {
                if (gameData[`text${i}`]) {
                    gameItems.push({
                        text: gameData[`text${i}`],
                        checked: gameData[`is_checked${i}`] === 1
                    });
                    
                    if (gameData[`is_checked${i}`] === 1) {
                        gameData.checkedIndices.push(i - 1);
                    }
                }
            }
            
            // יצירת פריטי המשחק בדף
            createGameItems(gameItems, gameData.checkedIndices);
        })
        .catch(error => {
            console.error("שגיאה בטעינת המשחק:", error);
            alert("אירעה שגיאה בטעינת המשחק.");
        });
    }
    
    // פונקציה ליצירת פריטי המשחק
    function createGameItems(gameItems, checkedIndices) {
        // שמירת האינדקסים המסומנים
        gameData.checkedIndices = checkedIndices;
        
        // יצירת סדר אקראי של הפריטים
        const indices = [...Array(gameItems.length).keys()];
        shuffleArray(indices);
        
        // יצירת הפריטים בסדר אקראי
        indices.forEach(index => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';
            gameItem.textContent = gameItems[index].text;
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