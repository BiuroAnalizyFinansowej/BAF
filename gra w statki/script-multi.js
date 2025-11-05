document.addEventListener('DOMContentLoaded', () => {

    // === ELEMENTY DOM ===
    const ownBoardEl = document.getElementById('own-board');
    const opponentBoardEl = document.getElementById('opponent-board');
    const ownTitleEl = document.getElementById('own-board-title');
    const opponentTitleEl = document.getElementById('opponent-board-title');
    const turnEl = document.getElementById('turn-display');
    const messageEl = document.getElementById('message-area');
    const passTurnButton = document.getElementById('pass-turn-button');
    const boardsContainer = document.getElementById('boards-container');

    // === USTAWIENIA GRY ===
    const boardSize = 8;
    const shipsToPlace = [
        { name: "Trzymasztowiec", length: 3 },
        { name: "Dwumasztowiec", length: 2 },
        { name: "Dwumasztowiec 2", length: 2 },
        { name: "Jednomasztowiec", length: 1 }
    ];
    
    // 0 = woda, 1 = statek, 2 = trafiony, 3 = pudło
    let player1Board;
    let player2Board;
    let totalHitsToWin = 0;
    
    // === STAN GRY ===
    let currentPlayer = 1;
    let player1Hits = 0;
    let player2Hits = 0;
    let isGameOver = false;
    let isTurnSwitching = false; // Blokuje kliknięcia podczas zmiany tury

    // === INICJALIZACJA GRY ===
    function startGame() {
        player1Board = placeShipsOnNewBoard();
        player2Board = placeShipsOnNewBoard();
        shipsToPlace.forEach(ship => totalHitsToWin += ship.length);
        
        passTurnButton.addEventListener('click', renderTurn);
        renderTurn(); // Rozpocznij pierwszą turę
    }

    // === LOGIKA TWORZENIA PLANSZY (taka sama jak poprzednio) ===

    function placeShipsOnNewBoard() {
        const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
        for (const ship of shipsToPlace) {
            let placed = false;
            while (!placed) {
                let isVertical = Math.random() < 0.5;
                let row = Math.floor(Math.random() * boardSize);
                let col = Math.floor(Math.random() * boardSize);

                if (canPlaceShip(board, row, col, ship.length, isVertical)) {
                    for (let i = 0; i < ship.length; i++) {
                        if (isVertical) board[row + i][col] = 1;
                        else board[row][col + i] = 1;
                    }
                    placed = true;
                }
            }
        }
        return board;
    }

    function canPlaceShip(board, row, col, length, isVertical) {
        if (isVertical) {
            if (row + length > boardSize) return false;
        } else {
            if (col + length > boardSize) return false;
        }
        for (let i = 0; i < length; i++) {
            let r = isVertical ? row + i : row;
            let c = isVertical ? col : col + i;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
                        if (board[nr][nc] === 1) return false;
                    }
                }
            }
        }
        return true;
    }

    // === LOGIKA RENDEROWANIA I TUR ===

    // Główna funkcja odświeżająca widok na początku każdej tury
    function renderTurn() {
        if (isGameOver) return;
        
        isTurnSwitching = false;
        // Pokaż plansze, ukryj przycisk
        boardsContainer.classList.remove('hidden');
        passTurnButton.classList.add('hidden');

        // Ustaw plansze i tytuły
        const ownLogicalBoard = (currentPlayer === 1) ? player1Board : player2Board;
        const opponentLogicalBoard = (currentPlayer === 1) ? player2Board : player1Board;
        
        turnEl.textContent = `Ruch: Gracz ${currentPlayer}`;
        ownTitleEl.textContent = `Plansza Gracza ${currentPlayer} (Twoje Statki)`;
        opponentTitleEl.textContent = `Plansza Gracza ${3 - currentPlayer} (Strzały)`;
        messageEl.textContent = "Wybierz cel na planszy przeciwnika.";

        // Narysuj obie plansze
        drawBoard(ownBoardEl, ownLogicalBoard, false); // false = nieklikalna (własna)
        drawBoard(opponentBoardEl, opponentLogicalBoard, true); // true = klikalna (przeciwnika)
    }

    // Funkcja pomocnicza do rysowania komórek na danej planszy
    function drawBoard(boardElement, logicalBoard, isClickable) {
        boardElement.innerHTML = ''; // Wyczyść planszę
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                const cellState = logicalBoard[row][col];

                if (isClickable) {
                    // To jest plansza przeciwnika (do strzelania)
                    if (cellState === 2) cell.classList.add('hit');
                    else if (cellState === 3) cell.classList.add('miss');
                    else cell.addEventListener('click', handleCellClick, { once: true });
                } else {
                    // To jest nasza własna plansza (do podglądu)
                    if (cellState === 1) cell.classList.add('ship');
                    else if (cellState === 2) { cell.classList.add('hit'); cell.classList.add('ship'); }
                    else if (cellState === 3) cell.classList.add('miss');
                }
                boardElement.appendChild(cell);
            }
        }
    }

    // === LOGIKA STRZELANIA ===

    function handleCellClick(event) {
        if (isGameOver || isTurnSwitching) return; // Zablokuj kliknięcia

        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        const opponentBoard = (currentPlayer === 1) ? player2Board : player1Board;
        const state = opponentBoard[row][col];

        if (state === 1) {
            // TRAFIONY!
            opponentBoard[row][col] = 2; // Oznacz jako trafiony
            cell.classList.add('hit');
            messageEl.textContent = "Trafiony! Strzelaj dalej.";

            if (currentPlayer === 1) player1Hits++;
            else player2Hits++;

            checkForWin();
            // Gracz strzela dalej, tura się NIE zmienia

        } else if (state === 0) {
            // PUDŁO!
            opponentBoard[row][col] = 3; // Oznacz jako pudło
            cell.classList.add('miss');
            messageEl.textContent = "Pudło! Przekaż turę.";
            
            // Zablokuj dalsze kliknięcia i rozpocznij proces zmiany tury
            isTurnSwitching = true;
            // Poczekaj 2 sekundy, żeby gracz zobaczył pudło, zanim ekran zniknie
            setTimeout(switchTurns, 2000); 
        }
    }

    function checkForWin() {
        const hits = (currentPlayer === 1) ? player1Hits : player2Hits;
        if (hits === totalHitsToWin) {
            isGameOver = true;
            messageEl.textContent = `GRACZ ${currentPlayer} WYGRYWA! WSZYSTKIE STATKI ZATOPIONE!`;
            turnEl.textContent = "Koniec Gry!";
            boardsContainer.classList.add('hidden');
            passTurnButton.classList.add('hidden');
        }
    }

    function switchTurns() {
        if (isGameOver) return;

        currentPlayer = (currentPlayer === 1) ? 2 : 1;
        
        // Ukryj plansze
        boardsContainer.classList.add('hidden');
        // Pokaż przycisk
        passTurnButton.classList.remove('hidden');

        // Zaktualizuj komunikaty na czas zmiany
        turnEl.textContent = `Kolej Gracza ${currentPlayer}`;
        messageEl.textContent = `Graczu ${3 - currentPlayer}, odwróć wzrok. Graczu ${currentPlayer}, naciśnij przycisk, gdy będziesz gotów.`;
        
        // Funkcja renderTurn() zostanie wywołana po kliknięciu przycisku
    }

    // Wystartuj grę
    startGame();
});
