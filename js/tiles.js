// Pokazywanie / chowanie listy
document.getElementById("toggleTiles").addEventListener("click", () => {
  const selector = document.getElementById("tileSelector");
  selector.classList.toggle("hidden");
});

// Filtrowanie listy
document.getElementById("searchTile").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  const items = document.querySelectorAll(".tile-item");

  items.forEach(item => {
    const name = item.dataset.name.toLowerCase();
    item.style.display = name.includes(filter) ? "flex" : "none";
  });
});

// Kafelki odczytywane z json

async function loadTiles() {
  const response = await fetch("json/tiles.json");  // pobiera plik
  const tiles = await response.json();        // zamienia na obiekt JS
  renderTiles(tiles);

  console.log(response);
  console.log(tiles);
}

function renderTiles(tiles) {
  const container = document.querySelector(".tile-list");
  container.innerHTML = "";

  tiles.forEach(tile => {
    const div = document.createElement("div");
    div.classList.add("tile-item");
    div.dataset.name = tile.Name;
    div.innerHTML = `
      <img src="css/${tile.Img}" alt="${tile.Name}">
      <span>${tile.Name}</span>
    `;
    container.appendChild(div);
    console.log(tile.Name + ", " + tile.Key +", " + tile.Img)
  });
}

// wywołanie
loadTiles();