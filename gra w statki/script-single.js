document.addEventListener('DOMContentLoaded', () => {

    const boardElement = document.getElementById('game-board');
    const messageElement = document.getElementById('message-area');
    const boardSize = 8;
    const shipsToPlace = [
        { name: "Trzymasztowiec", length: 3 },
        { name: "Jednomasztowiec 1", length: 1 },
        { name: "Jednomasztowiec 2", length: 1 }
    ];
    
    let totalHitsToWin = 0;
    shipsToPlace.forEach(ship => totalHitsToWin += ship.length); // Sumuje długości: 3 + 1 + 1 = 5
    
    let hits = 0;
    let gameBoard; // Teraz plansza będzie generowana

    // === NOWA LOGIKA ===

    // 1. Tworzy pustą planszę (wypełnioną zerami)
    function createEmptyBoard() {
        // Tworzy tablicę (boardSize) pełną tablic (boardSize) wypełnionych zerami.
        return Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
    }

    // 2. Sprawdza, czy można bezpiecznie umieścić statek
    // (Sprawdza, czy nie wychodzi poza planszę i czy nie dotyka innego statku)
    function canPlaceShip(board, row, col, length, isVertical) {
        // Sprawdź, czy statek mieści się na planszy
        if (isVertical) {
            if (row + length > boardSize) return false;
        } else {
            if (col + length > boardSize) return false;
        }

        // Sprawdź komórki docelowe ORAZ otaczające (zasada: statki nie mogą się stykać)
        for (let i = 0; i < length; i++) {
            let r = isVertical ? row + i : row;
            let c = isVertical ? col : col + i;

            // Pętla do sprawdzania sąsiadów (kwadrat 3x3 wokół każdej komórki statku)
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr; // nr = 'neighbor row'
                    let nc = c + dc; // nc = 'neighbor col'
                    
                    // Sprawdź, czy sąsiad jest na planszy
                    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
                        // Jeśli na tym polu (lub obok) jest już statek, to miejsce jest złe
                        if (board[nr][nc] === 1) return false;
                    }
                }
            }
        }
        return true; // Jeśli pętla przeszła, miejsce jest OK
    }

    // 3. Umieszcza statki na planszy
    function placeShips() {
        gameBoard = createEmptyBoard();

        for (const ship of shipsToPlace) {
            let placed = false;
            // Próbuj aż do skutku
            while (!placed) {
                let isVertical = Math.random() < 0.5;
                let row = Math.floor(Math.random() * boardSize);
                let col = Math.floor(Math.random() * boardSize);

                if (canPlaceShip(gameBoard, row, col, ship.length, isVertical)) {
                    // Mamy dobre miejsce, "rysujemy" statek na planszy
                    for (let i = 0; i < ship.length; i++) {
                        if (isVertical) {
                            gameBoard[row + i][col] = 1;
                        } else {
                            gameBoard[row][col + i] = 1;
                        }
                    }
                    placed = true;
                }
                // Jeśli 'placed' jest wciąż 'false', pętla 'while' spróbuje od nowa z nowymi koordynatami
            }
        }
    }

    // === KONIEC NOWEJ LOGIKI ===


    // Funkcja tworząca wizualną planszę (bez zmian)
    function createVisualBoard() {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', handleCellClick, { once: true });
                boardElement.appendChild(cell);
            }
        }
    }

    // Funkcja obsługująca kliknięcie komórki (bez zmian)
    function handleCellClick(event) {
        if (hits === totalHitsToWin) return; // Gra już wygrana

        const clickedCell = event.target;
        const row = clickedCell.dataset.row;
        const col = clickedCell.dataset.col;

        if (gameBoard[row][col] === 1) {
            clickedCell.classList.add('hit');
            messageElement.textContent = "Trafiony!";
            hits++;
            
            if (hits === totalHitsToWin) {
                messageElement.textContent = "Wszystkie statki zatopione! Wygrałeś!";
            }
        } else {
            clickedCell.classList.add('miss');
            messageElement.textContent = "Pudło!";
        }
    }

    // Start gry
    placeShips();       // Najpierw generujemy logiczną planszę ze statkami
    createVisualBoard(); // Potem budujemy jej wizualną reprezentację
    
    // Do debugowania - możesz odkomentować, żeby zobaczyć w konsoli, gdzie są statki
    // console.table(gameBoard); 
});
