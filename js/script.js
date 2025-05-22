let currentTool = 'cursor'; //Domyślnie narzędzie to pędzel
let isMouseDown = false; //Flaga do śledzenia stanu przycisku myszy
let startRow = null; //Początkowy wiersz
let startCol = null; //Początkowa kolumna
let endRow = null; //Końcowy wiersz
let endCol = null; //Końcowa kolumna
let IsIn = null;
let shiftPressed = false; //Flaga do śledzenia stanu klawisza Shift
let gridExists = false; //Flaga do śledzenia stanu siatki
let centerCell = null;
let cellCount = 0;

document.getElementById('generate').addEventListener('click', generateGrid);
document.getElementById('reset').addEventListener('click', resetGrid);

function resetGrid() {
    const coordinatesDisplay = document.getElementById('coordinates');
    document.querySelector('input[name="tool"][value="cursor"]').checked = true;
    currentTool = 'cursor';
    document.querySelector('input[type="checkbox"][id="switch"]').checked = false;
    document.getElementById('rows').value = 15;
    document.getElementById('cols').value = 15;
    circleOptions.style.display = 'none';
    coordinatesDisplay.textContent = `( , )`;
    generateGrid();
    activeCellsCount();
}

// Event listener zmieniający currentTool na podstawie wybranego narzędzia
document.querySelectorAll('input[name=tool]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentTool = e.target.value; // Ustawienie aktualnego narzędzia na wybrane

        circleOptions = document.getElementById('circle-options');
        if (currentTool === 'circle' || currentTool === 'circle-filled') {
            circleOptions.style.display = 'block';
        }
        else {
            circleOptions.style.display = 'none';

            if (centerCell) {
                centerCell.classList.remove('center');
                centerCell = null;
            }
            document.getElementById('centerX').value = '';
            document.getElementById('centerY').value = '';
        }
    });
});

// Event listener do sprawdzania, czy myszka jest wciśnięta
document.addEventListener('mousedown', (e) => {
    isMouseDown = true;
});

// Event listener do sprawdzania, czy myszka jest puszczona
document.addEventListener('mouseup', () => {
    isMouseDown = false
    if ((currentTool === 'rectangle' || currentTool === 'rectangle-filled') && startRow !== null && startCol !== null) {
        applyRectangle(); // Zastosowanie prostokąta
    }
});

// Event listener do sprawdzania, czy klawisz Shift jest wciśnięty
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        shiftPressed = true; // Ustawienie flagi shiftPressed na true
    }
});

// Event listener do sprawdzania, czy klawisz Shift jest puszczony
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
        shiftPressed = false; // Ustawienie flagi shiftPressed na false
    }
});

document.getElementById('drawCircleBtn').addEventListener('click', () => {
    const centerX = parseInt(document.getElementById('centerX').value);
    const centerY = parseInt(document.getElementById('centerY').value);
    const radius = parseInt(document.getElementById('radius').value);
    const eraserMode = document.getElementById('switch').checked;

    if (isNaN(centerX) || isNaN(centerY) || isNaN(radius)) {
        alert('Wprowadź poprawne wartości środka i promienia');
        return;
    }

    // Aktualizacja zaznaczenia center
    const newCenter = document.querySelector(`.cell[data-col="${centerX}"][data-row="${centerY}"]`);
    if (newCenter) {
        if (centerCell && centerCell !== newCenter) {
            centerCell.classList.remove('center');
        }

        centerCell = newCenter;
        centerCell.classList.add('center');
    }

    const cells = calculateCircleCells(centerX, centerY, radius);

    for (const cell of cells) {
        if (eraserMode) cell.classList.remove('active');
        else cell.classList.add('active');
    }
    activeCellsCount();
})

function generateGrid() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    const grid = document.getElementById('grid');
    const coordinatesDisplay = document.getElementById('coordinates');
    gridExists = true; // Ustawienie flagi siatki na true


    // Clear existing grid
    grid.innerHTML = '';
    grid.style.gridTemplateRows = `repeat(${rows + 1}, 40px)`;
    grid.style.gridTemplateColumns = `repeat(${cols + 1}, 40px)`;
    activeCellsCount();

    for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
            const cell = document.createElement('div');

            //Lewy górny róg - puste pola
            if (row === 0 && col === 0) {
                cell.className = 'header-cell';
                cell.textContent = '';
            }
            
            // Nagłówki kolumn (górny wiersz)
            else if (row === 0) {
                cell.className = 'header-cell';
                cell.textContent = col;
            }

            //Nagłówki wierszy (pierwsza kolumna)
            else if (col === 0) {
                cell.className = 'header-cell';
                cell.textContent = row;
            }

            //Normalne komórki
            else {
                cell.className = 'cell';
                cell.dataset.col = col; // x
                cell.dataset.row = row; // y

                // Mysz w siatce -> koordynaty
                cell.addEventListener('mouseenter', (e) => {
                    IsIn = true;
                    coordinatesDisplay.textContent = `(${col}, ${row})`;
                    //console.log(`Mouse entered cell: (${col}, ${row})`);
                    // Pędzel
                    if (!isMouseDown) return; // Jeśli myszka nie jest wciśnięta, nie rysuj
                    if (currentTool === 'brush') {
                        applyBrush(cell); // Zastosowanie pędzla
                    }
                    if (currentTool === 'rectangle' && isMouseDown) {
                        updateRectanglePreview(cell);
                    }
                    if (currentTool === 'rectangle-filled' && isMouseDown) {
                        updateRectanglePreview(cell);
                        //console.log(`StartCol = ${startCol}, StartRow = ${startRow}`);
                    }
                });

                cell.addEventListener('mousedown', (e) => {
                    if (e.button !== 0) return; // Sprawdzenie, czy lewy przycisk myszy jest wciśnięty
                    if (currentTool === 'brush') {
                        applyBrush(cell); // Zastosowanie pędzla
                    }
                    if (currentTool === 'rectangle') {
                        startRectangleDraw(cell); // Rozpoczęcie rysowania prostokąta
                        updateRectanglePreview(cell);
                    }
                    if (currentTool === 'rectangle-filled') {
                        startRectangleDraw(cell);
                        updateRectanglePreview(cell);
                    }
                    if (currentTool === 'circle' || currentTool === 'circle-filled') {
                        const newCenterCell = document.querySelector(`.cell[data-col="${col}"][data-row="${row}"]`);
                        if (newCenterCell !== centerCell && centerCell !== null) {
                            centerCell.classList.remove('center');
                        }
                        centerCell = newCenterCell;
                        centerCell.classList.add('center');


                        document.getElementById('centerX').value = col;
                        document.getElementById('centerY').value = row;
                    }
                });
            }
            grid.appendChild(cell);
        }
    }
    grid.addEventListener('mouseleave', () => {
        coordinatesDisplay.textContent = `( , )`;
    });
}

function clearPreview() {
    document.querySelectorAll('.cell.preview').forEach(cell => cell.classList.remove('preview'));
}

function applyBrush(cell) {
    const eraserMode = document.getElementById('switch').checked;

    if (eraserMode) {
        cell.classList.remove('active');
    }
    else {
        cell.classList.add('active');
    }
    activeCellsCount();
}

function startRectangleDraw(cell) {
    startCol = parseInt(cell.dataset.col);
    startRow = parseInt(cell.dataset.row);
    //console.log(`Start drawing rectangle at: (${startCol}, ${startRow})`);
}

function updateRectanglePreview(cell) {
    if (!gridExists || startRow === null || startCol === null) return;
    endCol = parseInt(cell.dataset.col);
    endRow = parseInt(cell.dataset.row);
    //console.log(`End drawing rectangle at: (${endCol}, ${endRow})`);
    clearPreview();

    const cells = calculateRectanglesArea(startCol, startRow, endCol, endRow);
    cells.forEach(cell => {
        cell.classList.add('preview');
    });
}

function applyRectangle(cell) {
    const eraserMode = document.getElementById('switch').checked;
    const cells = calculateRectanglesArea(startCol, startRow, endCol, endRow);

    for (const c of cells) {
        c.classList.remove('preview');
        if (eraserMode) c.classList.remove('active');
        else c.classList.add('active');
    }

    startRow = startCol = endRow = endCol = null;
    clearPreview();
    activeCellsCount();
}

function calculateRectanglesArea(c1, r1, c2, r2) {
    const result = [];

    if (currentTool === 'rectangle-filled') {
        if (shiftPressed) {
            const deltaCol = c2 - c1;
            const deltaRow = r2 - r1;
            const side = Math.max(Math.abs(deltaCol), Math.abs(deltaRow));

            const endCol = deltaCol >= 0 ? c1 + side : c1 - side;
            const endRow = deltaRow >= 0 ? r1 + side : r1 - side;

            const minCol = Math.min(c1, endCol);
            const maxCol = Math.max(c1, endCol);
            const minRow = Math.min(r1, endRow);
            const maxRow = Math.max(r1, endRow);

            for (let col = minCol; col <= maxCol; col++) {
                for (let row = minRow; row <= maxRow; row++) {
                    const cell = document.querySelector(`.cell[data-col="${col}"][data-row="${row}"]`);
                    if (cell) result.push(cell);
                }
            }

            return result;
        }
        else {
            const startCol = Math.min(c1, c2);
            const endCol = Math.max(c1, c2);
            const startRow = Math.min(r1, r2);
            const endRow = Math.max(r1, r2);

            for (let col = startCol; col <= endCol; col++) {
                for (let row = startRow; row <= endRow; row++) {
                    const cell = document.querySelector(`.cell[data-col="${col}"][data-row="${row}"]`);
                    if (cell) result.push(cell);
                }
            }

            return result;
        }
    }
    else if (currentTool === 'rectangle') {
        if (shiftPressed) {
            const deltaCol = c2 - c1;
            const deltaRow = r2 - r1;
            const side = Math.max(Math.abs(deltaCol), Math.abs(deltaRow));

            const endCol = deltaCol >= 0 ? c1 + side : c1 - side;
            const endRow = deltaRow >= 0 ? r1 + side : r1 - side;

            const minCol = Math.min(c1, endCol);
            const maxCol = Math.max(c1, endCol);
            const minRow = Math.min(r1, endRow);
            const maxRow = Math.max(r1, endRow);

            for (let col = minCol; col <= maxCol; col++) {
                for (let row = minRow; row <= maxRow; row++) {
                    if (row === minRow || row === maxRow || col === minCol || col === maxCol) {
                        const cell = document.querySelector(`.cell[data-col="${col}"][data-row="${row}"]`);
                        if (cell) result.push(cell);
                    }
                }
            }

            return result;
        }
        else {
            const startCol = Math.min(c1, c2);
            const endCol = Math.max(c1, c2);
            const startRow = Math.min(r1, r2);
            const endRow = Math.max(r1, r2);

            //console.log(`Start: (${(startCol)}, ${startRow}); End: (${(endCol)}, ${(endRow)})`);

            for (let col = startCol; col <= endCol; col++) {
                for (let row = startRow; row <= endRow; row++) {
                    if (row === startRow || row === endRow || col === startCol || col === endCol) {
                        const cell = document.querySelector(`.cell[data-col="${col}"][data-row="${row}"]`);
                        if (cell) result.push(cell);
                    }
                }
            }

            return result;
        }
    }
}

function calculateCircleCells(cx, cy, radius) {
    const result = [];

    for (let col = cx - radius; col <= cx + radius; col++) {
        for (let row = cy - radius; row <= cy + radius; row++) {
            const dx = col - cx;
            const dy = row -cy;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (currentTool === 'circle-filled') {
                if (distance <= radius + 0.4) {
                    const cell = document.querySelector(`.cell[data-col="${col}"][data-row="${row}"]`);
                    if (cell) result.push(cell);
                }
            }
            else if (currentTool === 'circle') {
                if (distance >= radius - 0.5 && distance <= radius + 0.5) {
                    const cell = document.querySelector(`.cell[data-col="${col}"][data-row="${row}"]`);
                    if (cell) result.push(cell)
                }
            }
        }
    }
    return result;
}

let x = 0;

function activeCellsCount() {
    const cellCountDisplay = document.getElementById('cellCount');
    cellCount = 0;
    let stackString = '';
    let stackLeftString = '';
    document.querySelectorAll('.cell.active').forEach(cell => {
        cellCount += 1;
    });
    stack = cellCount / 64;
    stack = Math.floor(stack);
    stackLeft = cellCount % 64;
    // Poprawny polski
    stackEnding = stack % 10;
    stackLeftEnding = stackLeft % 10;
    if (stack === 1) {
        stackString = 'stack'
    }
    else if (stack === 12 || stack === 13 || stack === 14 || stackEnding === 0 || stackEnding === 1 || stackEnding === 5 || stackEnding === 6 || stackEnding === 7 || stackEnding === 8 || stackEnding === 9) {
        stackString = 'stacków'
    }
    else if (stackEnding === 2 || stackEnding === 3 || stackEnding === 4) {
        stackString = 'stacki'
    }

    if (stackLeft === 1) {
    stackLeftString = 'blok'
    }
    else if (stackLeft === 12 || stackLeft === 13 || stackLeft === 14 || stackLeftEnding === 0 || stackLeftEnding === 1 || stackLeftEnding === 5 || stackLeftEnding === 6 || stackLeftEnding === 7 || stackLeftEnding === 8 || stackLeftEnding === 9) {
        stackLeftString = 'bloków'
    }
    else if (stackLeftEnding === 2 || stackLeftEnding === 3 || stackLeftEnding === 4) {
        stackLeftString = 'bloki'
    }

    cellCountDisplay.textContent = `Liczba aktywnych komórek to: ${cellCount} lub ${stack} ${stackString} i ${stackLeft} ${stackLeftString}.`;
}