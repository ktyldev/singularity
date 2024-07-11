// first, let's get all the elements we'll need from our DOM
const cardContainer = document.getElementById("card-container");
const cardCountElem = document.getElementById("card-count");
const cardTotalElem = document.getElementById("card-total");
const loader = document.getElementById("loader");

// we'll need a value for the max numaer of cards to be added to the page
const cardLimit = 99;
// then we'll define a variable for how many cards we want to increase the
// page by
const cardIncrease = 9;
// how many times can we increase the content until we reach the max limit?
const pageCount = Math.ceil(cardLimit / cardIncrease);
// and define a value to determine which page we're on
let currentPage = 1;

cardTotalElem.innerHTML = cardLimit;


function getRandomColor() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}deg, 90%, 85%)`;
}


function createCard(idx) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = idx;
    card.style.backgroundColor = getRandomColor();
    cardContainer.appendChild(card);
}


function addCards(pageIdx) {
    currentPage = pageIdx;

    const startRange = (pageIdx - 1) * cardIncrease;
    const endRange = currentPage == pageCount
        ? cardLimit
        : pageIdx * cardIncrease;

    cardCountElem.innerHTML = endRange;

    for (let i = startRange + 1; i <= endRange; i++) {
        createCard(i);
    }
}


function handleInfiniteScroll() {
    throttle(() => {
        const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

        if (endOfPage) {
            addCards(currentPage + 1);
        }

        if (currentPage === pageCount) {
            removeInfiniteScroll();
        }
    }, 1000);
}


var throttleTimer;
function throttle(callback, time) {
    if (throttleTimer) return;

    throttleTimer = true;

    setTimeout(() => {
        callback();
        throttleTimer = false;
    }, time);
}


function removeInfiniteScroll() {
    loader.remove();
    window.removeEventListener("scroll", handleInfiniteScroll);
}

addCards(currentPage);
window.addEventListener("scroll", handleInfiniteScroll);

// TODO: define the limit of the content to be loaded on the page
// TODO: detect when the user has reached the end of the content container
// TODO: load more content once the end of the container has been reached
// TODO: if there's no more content to be loaded, stop the infinite scroll
