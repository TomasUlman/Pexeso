'use strict';

/* Proměnná score, bude vždy začínat na 0 a přičte se 1, pokud hráč najde dvě stejné karty
   Hra skončí, až score bude 30 */
let score = 0;
const scoreElement = document.getElementById('score'); // Element, kam se bude score vypisovat

/* Proměnná určuje počet párů pexesa. 
   Zároveň je to maximální skóre, kterého lze dosáhnout */
let maxScore = 30;

// Proměnná attempts bude měřit počet neplatných pokusů
let attempts = 0;
const attemptsElement = document.getElementById('attempts'); // Element, kam se budou neplatné pokusy vypisovat

let container = document.querySelector(`.container${maxScore}`); // Objekt obsahující všech 60 kartiček, dovnitř se vykreslují

const endElement = document.querySelector('.end'); // Element, kde se zobrazuje hláška, když je konec hry

let activeCardStyle = document.querySelector('.activeCardStyle').classList[1]; // Zde je uloženo číslo stylu zadní strany karet

// inicializace hracích kartiček a vykreslení všech do kontejneru
function initDeck() {

    // Pole, kam se vloží všechny kartičky
    const deck = [];

    // Vytvoření HTML řetězce reprezentujícího kartu
    let cardHTML1 = '';
    let cardHTML2 = '';

    /* Cyklem vytvoříme kartičky a naplníme jimi pole, obsahuje vždy 2x stejnou.
    Element obsahuje třídy card, číslo páru = i, identifikaci karty v páru (číslo -1 nebo -2)
    a pairs + maxScore (určuje styl karty podle zvoleného počtu párů */
    for (let i = 0; i < maxScore; i++) {
        cardHTML1 = `
        <div class="card ${i} -1 pairs${maxScore} cardBg${activeCardStyle}">
            <div class="card__face card__face--front"></div>
            <div class="card__face card__face--back">
                <img src="images/cards/IMG-${i}.jpg" alt="img">
            </div>
        </div>
        `;
        cardHTML2 = `
        <div class="card ${i} -2 pairs${maxScore} cardBg${activeCardStyle}">
            <div class="card__face card__face--front"></div>
            <div class="card__face card__face--back">
                <img src="images/cards/IMG-${i}.jpg" alt="img">
            </div>
        </div>
        `;
        // Vložení vytvořených kartiček do pole která následně zamícháme 
        deck.push(cardHTML1);
        deck.push(cardHTML2);
    }

    // Tato funkce zamíchá prvky v poli
    deck.sort(function () {
        return 0.5 - Math.random();
    });

    // Vykreslení všech kartiček do kontejneru
    deck.forEach(cardHTML => {
        container.innerHTML += cardHTML;
    });

    // Volání funkce, která pořiřadí kartám event listener a řídí hru
    createCardListeners();
};

// Zavoláme funkci inicializace všech kartiček pro první hru
initDeck();

/* Funkce vytvoření prodlevy */
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Funkce řídící logiku hry
function createCardListeners() {

    // Pomocné proměnné kam se ukládají první a druhá kliknutá karta
    let firstClickedCard = null;
    let secondClickedCard = null;

    // Výběr všech elementů se třídou "card" (všechny kartičky)
    let cards = document.querySelectorAll(".card");

    // Přiřadí cyklem ke každé kartě eventListener (kliknutí)
    cards.forEach(card => {
        card.addEventListener("click", async function () {

            const clickedCard = this; // Uložení karty na kterou bylo právě kliknuto

            /* Pokud je kliknutá karta stejná jako první kliknutá, ukončíme funkci, 
               aby nedošlo k uložení stejné karty také do secondClickedCard */
            if (clickedCard === firstClickedCard) {
                return;
            }

            if (!firstClickedCard) {
                firstClickedCard = clickedCard; // Do firstClickedCard se uloží právě kliknutá karta
                firstClickedCard.classList.add('is-flipped'); // Třída is-flipped otočí kartu obrázkem nahoru
            } else if (!secondClickedCard) {
                secondClickedCard = clickedCard; // Do secondClickedCard se uloží právě kliknutá karta
                secondClickedCard.classList.add('is-flipped'); // Třída is-flipped otočí kartu obrázkem nahoru

                // Zde probíhá porovnání firstClickedCard a secondClickedCard
                if ((Number(firstClickedCard.classList[1]) === Number(secondClickedCard.classList[1])) &&
                    (Number(firstClickedCard.classList[2]) !== Number(secondClickedCard.classList[2]))) {
                    await delay(1000); // Prodleva 1 sekunda
                    firstClickedCard.classList.add('invisible'); // Pokud jsou stejné, karty přidáním třídy invisible zmizí
                    secondClickedCard.classList.add('invisible');
                    score++; // Score se zvíší o 1
                    scoreElement.textContent = score; // Score se zobrazí na elemntu
                    victoryCheck(); // Provedení kontroly skóre, zda není konec hry
                } else {
                    await delay(2000); // Prodleva 2 sekundy
                    firstClickedCard.classList.remove('is-flipped'); // Pokud nebyly nalezeny dvě stejné karty, otočí se zpět
                    secondClickedCard.classList.remove('is-flipped');
                    attempts++; // Neplatné pokusy se zvíší o 1
                    attemptsElement.textContent = attempts; // Neplatné pokusy se zobrazí na elemntu
                }

                // Po provedení kola ať už byly nalezeny dvě stejné nebo ne resetují se pomocné proměnné
                firstClickedCard = null;
                secondClickedCard = null;
            }
        });
    });
};

/* Funkce kontroluje, zda bylo dosaženo maximálního score. 
   Pokud ano, odkryje element,který oznámení zobrazuje */
async function victoryCheck() {
    if (score === maxScore) {
        await delay(1000); // Prodleva 1 sekunda
        endElement.classList.remove('hidden');
    } else return;
};

// Tlačítko nová hra
const newGameBtn = document.querySelector('.newGameBtn');
newGameBtn.addEventListener('click', newGame);

/* Pokud se klikne na tlačítko nová hra, vymaže se obsah elementu container,
   vynuluje se score, vynulujou se neplatné pokusy a inicializuje se nový 
   balíček karet, hra se opakuje. */
async function newGame() {
    container.innerHTML = '';
    container.classList.remove('animated-deck');
    score = 0;
    scoreElement.textContent = score;
    attempts = 0;
    attemptsElement.textContent = attempts;
    await delay(100);
    initDeck();
    container.classList.add('animated-deck');
    endElement.classList.add('hidden');
};

/* Tlačítko uložit nastavení, před zavoláním změny nastavení musí smazat obsah aktuálního containeru
   a poté může hru zresetovat, nedojde tak k překrytí obsahu */
const saveSettingsBtn = document.querySelector('.saveSettingsBtn');
saveSettingsBtn.addEventListener('click', function () {
    container.innerHTML = '';
    changeSettings();
    newGame();
});

// Funkce změny nastavení
function changeSettings() {

    const numberOfPairs = document.getElementById('numberOfPairs'); // Jedná se o select element, počet párů karet (30/20/10)
    // Pokud selectem něco vybereme přenastaví se proměnná maxScore
    numberOfPairs.addEventListener('change', function () {
        maxScore = Number(numberOfPairs.value);
    });

    /* Počet párů */
    numberOfPairs.dispatchEvent(new Event('change'));
    container = document.querySelector(`.container${maxScore}`);

    // Dle čísla stylu v nastavení se doplní číslo do proměnné a styl se změní na příslušnou třídu
    activeCardStyle = document.querySelector('.activeCardStyle').classList[1];
};


/* ------------------- Modální okno ------------------------------ */
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.close-modal');
const btnSettings = document.querySelector('.settings');

function openModal() {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
};

function closeModal() {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
};

btnSettings.addEventListener('click', openModal);

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden'))
        closeModal();
});
/* ------------------- Konec modálního okna ---------------------- */



/* ------------------- Obsluha stylů karet ----------------------- */
const cardStyles = document.querySelectorAll('.cardStyle');
cardStyles.forEach(cardStyle => {
    cardStyle.addEventListener('click', function () {
        // Odstranění třídy activeCardStyle ze všech prvků s třídou .cardStyle
        cardStyles.forEach(element => {
            element.classList.remove('activeCardStyle');
        });
        // Přidání třídy activeCardStyle pouze na aktuální prvek
        cardStyle.classList.add('activeCardStyle');
    });
});
/* ---------------- Konec obsluhy stylů karet -------------------- */