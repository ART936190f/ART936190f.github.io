// === ГЛОБАЛЬНІ ЗМІННІ ===
let ROWS = 10;
let COLS = 10;
let MINES = 10;
const BOARD_DOM = document.getElementById('board');
let currentGame = null; 

// Функція для зчитування даних і запуску гри
function startGame() {
    const sizeInput = document.getElementById('matrixSize').value;
    const bombInput = document.getElementById('matrixBomb').value;

    const newSize = parseInt(sizeInput, 10);
    const newMines = parseInt(bombInput, 10);
    const totalCells = newSize * newSize;

    // Посилена перевірка вводу
    if (isNaN(newSize) || isNaN(newMines) || newSize < 5 || newSize > 30 || newMines < 1 || newMines >= totalCells) {
        alert(`Будь ласка, введіть коректні значення. Розмір сітки від 5 до 30. Кількість бомб від 1 до ${totalCells - 1}.`);
        return;
    }

    // Оновлення глобальних змінних
    ROWS = newSize;
    COLS = newSize;
    MINES = newMines;

    // Оновлення змінних CSS
    document.documentElement.style.setProperty('--rows', ROWS);
    document.documentElement.style.setProperty('--cols', COLS);

    // Створення нового екземпляру гри
    currentGame = new MinesweeperGame(ROWS, COLS, MINES);
}

// Функція для виведення FAQ
function info() {
    alert("Це гра Сапер. Ваша мета — відкрити всі безпечні клітинки.");
}


/**
 * Клас, що інкапсулює ігровий стан та логіку.
 */
class MinesweeperGame {
    constructor(rows, cols, mines) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.board = []; 
        this.gameStatus = 'AwaitingFirstMove';

        this.initializeBoard();
        this.placeMines();
        this.calculateValues();
        this.renderBoard();
    }

    initializeBoard() {
        for (let y = 0; y < this.rows; y++) {
            this.board[y] = []; 
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = {
                    isMine: false,
                    value: 0,
                    isRevealed: false,
                    isFlagged: false,
                };
            }
        }
    }

    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const x = Math.floor(Math.random() * this.cols);
            const y = Math.floor(Math.random() * this.rows);

            if (!this.board[y][x].isMine) {
                this.board[y][x].isMine = true;
                minesPlaced++;
            }
        }
    }

    calculateValues() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x].isMine) continue;

                let mineCount = 0;
                // Перевірка 8 сусідів (включно з діагоналями)
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                            if (this.board[ny][nx].isMine) {
                                mineCount++;
                            }
                        }
                    }
                }
                this.board[y][x].value = mineCount;
            }
        }
    }

    /**
     * Основна функція гри: розкриття клітинки.
     */
    revealCell(x, y) {
        const cell = this.board[y][x];

        // Якщо вже розкрито, стоїть прапорець, або гра закінчена -> вихід
        if (cell.isRevealed || cell.isFlagged || this.gameStatus === 'Failed' || this.gameStatus === 'Completed') {
            return;
        }

        // Встановлення статусу гри після першого ходу
        if (this.gameStatus === 'AwaitingFirstMove') {
            this.gameStatus = 'InProgress';
            console.log("Гра розпочата!");
        }

        cell.isRevealed = true;
        this.updateDOMCell(x, y);

        if (cell.isMine) {
            this.gameStatus = 'Failed';
            this.handleGameOver(false);
            return;
        }

        // Якщо клітинка порожня (значення 0) -> Flood-Fill
        if (cell.value === 0) {
            this.floodFill(x, y);
        }

        this.checkWinCondition();
    }

    /**
     * Алгоритм Flood-Fill для рекурсивного розкриття (8 напрямків).
     */
    floodFill(x, y) {
        // Перевірка 8 сусідів (включно з діагоналями)
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue; // Пропускаємо центральну клітинку
                
                const nx = x + dx;
                const ny = y + dy;

                // Умова зупинки 1: вихід за межі
                if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) continue;

                const cell = this.board[ny][nx];

                // Умова зупинки 2: вже розкрито, міна, або прапорець
                if (cell.isRevealed || cell.isMine || cell.isFlagged) continue;

                cell.isRevealed = true;
                this.updateDOMCell(nx, ny);

                // Умова зупинки 3: зупиняємо рекурсію, якщо дісталися клітинки з числом > 0
                if (cell.value === 0) {
                    this.floodFill(nx, ny); // Рекурсивний виклик, якщо клітинка теж порожня
                }
            }
        }
    }

    toggleFlag(x, y) {
        const cell = this.board[y][x];
        if (!cell.isRevealed && this.gameStatus === 'InProgress') {
            cell.isFlagged = !cell.isFlagged;
            this.updateDOMCell(x, y);
            this.checkWinCondition();
        }
    }

    updateDOMCell(x, y) {
        const cell = this.board[y][x];
        const domElement = document.getElementById(`${x}:${y}`);
        if (!domElement) return;

        domElement.className = 'cell'; 
        domElement.textContent = ''; 
        domElement.removeAttribute('data-value');

        if (cell.isRevealed) {
            domElement.classList.add('revealed');
            if (cell.isMine) {
                domElement.classList.add('mine');
                domElement.textContent = '💣';
            } else if (cell.value > 0) {
                domElement.textContent = cell.value;
                domElement.setAttribute('data-value', cell.value);
            }
        } else if (cell.isFlagged) {
            domElement.classList.add('flagged');
            domElement.textContent = '🚩';
        } else {
            domElement.textContent = '';
        }
    }

    /**
     * Перевіряє умову перемоги (Виправлено: лише безпечні клітинки).
     */
    checkWinCondition() {
        let safeCellsRevealed = 0;
        const totalSafeCells = this.rows * this.cols - this.mines;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.board[y][x];
                if (cell.isRevealed && !cell.isMine) {
                    safeCellsRevealed++;
                }
            }
        }

        // Умова перемоги: всі безпечні клітинки розкрито
        if (safeCellsRevealed === totalSafeCells) {
            this.gameStatus = 'Completed';
            this.handleGameOver(true);
        }
        // Видалено неточну додаткову умову перемоги з прапорцями
    }

    handleGameOver(isWin) {
        const message = isWin ? '🎉 Вітаємо! Ви перемогли! 🎉' : '💥 Гра закінчена. Ви натрапили на міну! 💥';
        alert(message);

        // Розкриваємо всі міни
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x].isMine && !this.board[y][x].isRevealed) {
                    this.board[y][x].isRevealed = true;
                    this.updateDOMCell(x, y);
                }
            }
        }
    }

    renderBoard() {
        BOARD_DOM.innerHTML = '';
        BOARD_DOM.className = 'board'; 

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'cell';
                cellDiv.id = `${x}:${y}`;

                cellDiv.addEventListener('click', () => this.revealCell(x, y));
                cellDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); 
                    this.toggleFlag(x, y);
                });

                BOARD_DOM.appendChild(cellDiv);
            }
        }
    }
}

// === ІНІЦІАЛІЗАЦІЯ ===
document.addEventListener('DOMContentLoaded', () => {
    console.log("Введіть розмір сітки та кількість бомб і натисніть START.");
});
