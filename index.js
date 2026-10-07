const drawBtn = document.querySelector("#draw-button");
const pokeball = document.querySelector("#pokeball");
const pokemonImg = document.querySelector("#pokemon-image");
const statusMsg = document.querySelector("#status-message");
const pokemonNum = document.querySelector("#pokemon-number");
const pokemonName = document.querySelector("#pokemon-name");
const dexCnt = document.querySelector("#dex-count");
const dexBtn = document.querySelector("#dex-button");
const dexPanel = document.querySelector("#dex-panel");
const dexList = document.querySelector("#dex-list");
const dexMax = document.querySelector("#dex-max");
const resetBtn = document.querySelector("#reset-button");
const languageBtn = document.querySelectorAll(".language-button");

const savedPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || [];
const caughtPokemon = new Map(savedPokemon);
const MAX_POKEMON = 151;
dexMax.textContent = MAX_POKEMON;

let currentLanguage = "en";
let currentPokemon = null;

async function getMon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);

  if (!res.ok) {
    throw new Error("Failed to load pokemon.");
  }

  const data = await res.json();
  const koreanName = data.names.find((x) => x.language.name === "ko");
  const englishName = data.names.find((x) => x.language.name === "en");
  const japaneseName = data.names.find((x) => x.language.name === "ja");

  return {
    id: id,
    koreanName: koreanName.name,
    englishName: englishName.name,
    japaneseName: japaneseName.name,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
  };
}

languageBtn.forEach((x) => {
  x.addEventListener("click", () => {
    currentLanguage = x.dataset.lang;

    languageBtn.forEach((y) => {
      y.classList.remove("active");
    });
    x.classList.add("active");

    if (currentPokemon) {
      pokemonName.textContent = getPokemonName(currentPokemon);
    }

    renderDex();
  });
});

function getPokemonName(x) {
  if (currentLanguage === "ko") return x.koreanName;
  if (currentLanguage === "jp") return x.japaneseName;
  return x.englishName;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function saveDex() {
  const pokemonArray = Array.from(caughtPokemon);

  localStorage.setItem("caughtPokemon", JSON.stringify(pokemonArray));
}

function renderDex() {
  dexCnt.textContent = caughtPokemon.size;
  dexList.innerHTML = "";

  caughtPokemon.forEach((x) => {
    const item = document.createElement("div");

    item.classList.add("dex-item");
    item.innerHTML = `
      <img src="${x.image}" alt="${x.name}">
      <p>No.${x.id} ${getPokemonName(x)}</p>
    `;

    dexList.appendChild(item);
  });
}

function resetGame() {
  const noCap = confirm("Are you sure you wanna reset your pokedex?");
  if (!noCap) return;
  caughtPokemon.clear();
  localStorage.removeItem("caughtPokemon");
  renderDex();
}

async function drawPokemon() {
  const id = Math.floor(Math.random() * MAX_POKEMON) + 1;
  drawBtn.disabled = true;
  pokemonImg.style.display = "none";
  pokeball.style.display = "block";
  pokeball.classList.add("shaking");
  statusMsg.textContent = "Shake, shake...";

  try {
    const [pokemon] = await Promise.all([getMon(id), sleep(1500)]);
    currentPokemon = pokemon;
    pokeball.style.display = "none";
    pokemonImg.style.display = "block";
    pokemonImg.src = pokemon.image;
    pokemonImg.alt = getPokemonName(pokemon);
    pokemonNum.textContent = `No.${pokemon.id}`;
    pokemonName.textContent = getPokemonName(pokemon);

    if (caughtPokemon.has(pokemon.id)) {
      statusMsg.textContent = "Got another one!";
    } else {
      caughtPokemon.set(pokemon.id, pokemon);
      statusMsg.textContent = "Gotcha!";
      saveDex();
      renderDex();
    }
  } catch (error) {
    pokemonImg.style.display = "none";
    pokeball.style.display = "block";
    pokemonNum.textContent = "";
    pokemonName.textContent = "";
    statusMsg.textContent = "No way it got away! Try again...";
    console.error(error);
  } finally {
    pokeball.classList.remove("shaking");
    drawBtn.disabled = false;
  }
}

resetBtn.addEventListener("click", resetGame);

drawBtn.addEventListener("click", drawPokemon);

dexBtn.addEventListener("click", () => {
  dexPanel.classList.toggle("open");
});

renderDex();
