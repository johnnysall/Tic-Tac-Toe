const aiBtn = document.getElementById("aiBtn");
const playerBtn = document.getElementById("playerBtn");
let againstAI = false;
aiBtn.addEventListener("click", function() {
    againstAI = true;
    gameSetup.vsPlayer("ai");
});
playerBtn.addEventListener("click", function() {
    againstAI = false;
    gameSetup.vsPlayer("player");
});

const submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", function() {
    gameSetup.gameInfo();
});

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", function() {
    gameManagement.resetGame();
});

const gridContainer = document.getElementById("gridContainer");

const p1DetailsContainer = document.getElementById("p1Container");
const p2DetailsContainer = document.getElementById("p2Container");
const playerAITitle = document.getElementById("playerAITitle");

const scoreVisualiser = document.getElementById("scoreVisualiser");
const p1ScoreVis = document.getElementById("p1ScoreVis");
const p2ScoreVis = document.getElementById("p2ScoreVis");
const p1Score = document.getElementById("p1Score");
const p2Score = document.getElementById("p2Score");
let score = [0,0];

const winnerText = document.getElementById("winnerText");
const gameWinner = document.getElementById("gameWinner");
gameWinner.addEventListener("click", function() {
    gameManagement.resetGame();
});

const gameBoard = ["0","1","2","3","4","5","6","7","8"];
const boardValues = ["", "", "", "", "", "", "", "", ""];
// All Possible ways of winning the game
const possibleWins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// How far ahead the AI can think - basically the difficulty
// 0 = Easy, 
// 1 = Medium, 
// 2 = Impossible
let searchDepth = 0;

// Player 1 = naughts, Player 2 = Crosses
const player1 = { name: "Player1", symbol: "x" }
const player2 = { name: "Player2", symbol: "o" }

let player = player1;
let startPlayer = player1;

const gameSetup = (() => {
    const vsPlayer = (playerType) => {
        if (playerType == "player"){
            p1DetailsContainer.style.width = "40%";
            p2DetailsContainer.style.width = "40%";
            p2DetailsContainer.style.margin = "0 2.5% 20px 2.5%";
            p2DetailsContainer.style.padding = "2.5%";
            playerAITitle.innerText = "Player vs Player";
        } else{
            p1DetailsContainer.style.width = "90%";
            p2DetailsContainer.style.width = "0%";
            p2DetailsContainer.style.margin = "0%";
            p2DetailsContainer.style.padding = "0%";
            playerAITitle.innerText = "Player vs AI";
        }
    }
    
    const gameInfo = () => {
        p1Name = document.getElementById("P1Name").value;
        p1Symbol = document.getElementById("P1Symbol").value;

        if (againstAI === false){
            p2Name = document.getElementById("P2Name").value;
            p2Symbol = document.getElementById("P2Symbol").value;

            let playerValues = [[],["Please Enter a Name",
                                    "Must be a Single Character",
                                    "Please Enter a Name",
                                    "Must be a Single Character"]];

            playerValues[0].push(p1Name, p1Symbol, p2Name, p2Symbol);

            if (playerValues[0].includes("")){
                resetForms();
            } else {
                if (playerValues[0][0] !== playerValues[0][2]) {
                    if (playerValues[0][1] !== playerValues[0][3]) {
                        if (playerValues[0][1].length === 1){
                            if (playerValues[0][3].length === 1){
                                player1.name = playerValues[0][0];
                                player2.name = playerValues[0][2];
                                player1.symbol = playerValues[0][1];
                                player2.symbol = playerValues[0][3];
                                gameManagement.startGame();
                            } else {
                                console.log("Must be a Single Character");
                                resetForms();
                            }
                        } else {
                            console.log("Must be a Single Character");
                            resetForms();
                        }
                    } else {
                        console.log("Cant have the same Symbol");
                        resetForms();
                    }
                } else {
                    document.getElementById("P1Name").setCustomValidity("I expect an e-mail, darling!");
                    console.log("Cant have the same Name");
                    //resetForms();
                }
            }
        } else {
                if (p1Name !== ""){ player1.name = p1Name; }
                if (p1Symbol !== ""){ player1.symbol = p1Symbol; }

                player2.name = "ai";
                if (p1Symbol === "x"){
                    player2.symbol = "o";
                } else {
                    player2.symbol = "x";
                }
                gameManagement.startGame();
        }
    }

    const resetForms = () =>{
        document.getElementById("P1Name").value = "";
        document.getElementById("P1Symbol").value = "";
        document.getElementById("P2Name").value = "";
        document.getElementById("P2Symbol").value = "";
    }

    return { vsPlayer, gameInfo, resetForms };
})();

const getBoardElement = () => {
    const gridItems = [];
    let x = 0;
    while (x < 9){
        gridItems[x] = document.getElementById("grid" + x);
        let location = x;
        gridItems[x].addEventListener("click", function() {
            this.removeEventListener('click', arguments.callee);
            gameManagement.updateBoard(location);
        });
        x++;
    };
};

const gameManagement = (() => {
    const startGame = () => {
        player = player1;
        startPlayer = player1;

        gameWinner.style.display = "none";
        document.getElementById("indexMain").classList.add("toGamePage");
        p1Score.innerText = player1.name + ": " + score[0];
        p2Score.innerText = player2.name + ": " + score[1];
        getBoardElement();
    }

    const showGameWinner = (winner) => {
        gameWinner.style.display = "block";
        winnerText.innerText = winner;
    }

    const changeScoreVisualiser = () => {
        if (score[0] === 0) {
            p1ScoreVis.style.width = "0%";
            p2ScoreVis.style.width = "100%";
        } else {
            let totalPlays = score[0] + score[1];
            let p1Percent = (100/totalPlays)*score[0];
            p1ScoreVis.style.width = p1Percent + "%";
            p2ScoreVis.style.width = (100 - p1Percent) + "%";
        }
    }

    const resetGame = () => {
        gameWinner.style.display = "none";
        resetBoard();
        if (startPlayer === player1) {
            startPlayer = player2;
        } else {
            startPlayer = player1;
        }
        player = startPlayer;
        if (againstAI === true && player === player2) {
            AI.bestMove();
        }
        getBoardElement();
    }

    const resetBoard = () => {
        for (let i = 0; i < boardValues.length; i++) {
            var grid = document.getElementById("grid" + i);
            boardValues[i] = "";
            grid.remove();
            var gridToAdd = document.createElement("div");
            gridToAdd.className = "singleGrid emptyGrid";
            gridToAdd.id = "grid" + i;
            gridToAdd.addEventListener("click", function() {
                this.removeEventListener('click', arguments.callee);
                gameManagement.updateBoard(location);
            });

            gridContainer.appendChild(gridToAdd);
        }
    }

    const updateBoard = (location) => {
        if (boardValues[location] === "") {
            boardValues[location] = player.name;
        } else {
            return;
        }
        
        var grid = document.getElementById("grid" + location);
        try {
            grid.classList.remove("emptyGrid");
            grid.classList.add("full");
            grid.classList.add(player.name);
        } catch {
            return;
        }

        grid.removeEventListener("click", function() {
            this.removeEventListener('click', arguments.callee);
            gameManagement.updateBoard(location);
        });
        grid.innerText = player.symbol;
        var result = checkForWin(boardValues);
        if (result !== null){
            if (result === "draw") {
                score[0] += 1;
                score[1] += 1;
                p1Score.innerText = player1.name + ": " + score[0];
                p2Score.innerText = player2.name + ": " + score[1];
                changeScoreVisualiser();
                showGameWinner("Draw!");
            } else {
                if (result === player1.name){
                    score[0] += 1;
                } else {
                    score[1] += 1;
                }
                p1Score.innerText = player1.name + ": " + score[0];
                p2Score.innerText = player2.name + ": " + score[1];
                changeScoreVisualiser();
                showGameWinner(player.name + " Wins!");
            }
        }
        changePlayer();
    }

    const changePlayer = () => {
        if (player === player1){
            player = player2;
            if (againstAI === true) {
                AI.bestMove();
            }
        } else {
            player = player1;
        }
    }


    const checkForWin = (boardToCheck) => {
        // iterate through each possible win
        for (let oi = 0; oi < possibleWins.length; oi++) {
            // Only search the ones the user just clicked - makes it more efficient 
            let winCheck = 0;
            // Check each value in the possible win array 
            for (let ii = 0; ii < possibleWins[oi].length; ii++){
                // Find the player that may have one
                let playerToCheck = boardValues[possibleWins[oi][0]];
                if (boardToCheck[possibleWins[oi][ii]] === playerToCheck && playerToCheck !== ""){
                    winCheck++
                    if (winCheck == 3){
                        return playerToCheck;
                    }
                } else {
                    break;
                }
            } 

        }
        if (!boardToCheck.includes("")){
            return "draw";
        }
        return null;
    }
    return {startGame, showGameWinner, resetGame, resetBoard, updateBoard, changePlayer, checkForWin};
})();

const AI = (() => {
    const bestMove = () => {
        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < boardValues.length; i++){
            if (boardValues[i] === ""){
                boardValues[i] = player2.name;
                let score = miniMax(boardValues, false, 0);
                boardValues[i] = "";

                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        gameManagement.updateBoard(move);
    }

    const miniMax = (board, isMaximising, depth) => {
        let result = gameManagement.checkForWin(board);
        if (result !== null) {
            if (result === "draw"){
                return 0;
            } if (result === "ai"){
                return 100-depth;
            } else {
                return -100+depth;
            } 
        }

        if (isMaximising === true) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++){
                if (board[i] === ""){
                    board[i] = player2.name;
                    let score = miniMax(board, false, depth + 1);
                    board[i] = "";
                    if (score > bestScore) {
                        bestScore = score;
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++){
                if (board[i] === ""){
                    board[i] = player1.name;
                    let score = miniMax(board, true, depth + 1);
                    board[i] = "";
                    if (score < bestScore) {
                        bestScore = score;
                    }
                }
            }
            return bestScore;
        }
    };

    const aiMove = () => {
        // Search Depth changes according to difficulty
        if (boardValues.includes(player1.name) || boardValues.includes(player2.name)) {
            // List of possible moves in first nested list and second nested list is the scores
            let possibleMoves = [[], []];
            // Search through current board values to show which board places are empty
            for (let i = 0; i < boardValues.length; i++){
                if (boardValues[i] === ""){
                    possibleMoves[0].push(i);
                }
            }

            // If theres only one possible move the AI must just make that move
            if (possibleMoves[0].length === 1){
                updateBoard(possibleMoves[0][0]);
            } else {
                possibleMoves[0].forEach(location => {
                    gameManagement.checkForWin(location);
                });
            }

        } else {
            boardValues[0] = player2.name;
        }
    }

    return {bestMove, miniMax, aiMove};
})();