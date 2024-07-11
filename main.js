// first, let's get all the elements we'll need from our DOM
const postContainer = document.getElementById("post-container");
const postCountElem = document.getElementById("post-count");
const postTotalElem = document.getElementById("post-total");
const loader = document.getElementById("loader");

// we'll need a value for the max numaer of posts to be added to the page
const postLimit = 99;
// then we'll define a variable for how many posts we want to increase the
// page by
const postIncrease = 9;
// how many times can we increase the content until we reach the max limit?
const pageCount = Math.ceil(postLimit / postIncrease);
// and define a value to determine which page we're on
let currentPage = 1;

postTotalElem.innerHTML = postLimit;


function getRandomColor() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}deg, 90%, 85%)`;
}


function getUsername() {
    const usernames = [
        "xXPu55y5l4y3r69Xx",
        "Keef Farmer",
        "Alan"
    ];

    const r = Math.floor(Math.random() * usernames.length);
    return usernames[r];
}


function getContent() {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
}


class Post {
    constructor() {
        this.username = getUsername();
        this.content = getContent();
    }

    getElement() {
        const postElem = document.createElement("div");
        postElem.className = "post";
        postElem.style.backgroundColor = getRandomColor();

        // add a header to the post
        const headerElem = document.createElement("h1");
        headerElem.innerHTML = this.username;
        postElem.appendChild(headerElem);

        // TODO: add content to the post
        const contentElem = document.createElement("p");
        contentElem.innerHTML = this.content;
        postElem.appendChild(contentElem);

        return postElem;
    }
}


function createPost() {
    const post = new Post();
    postContainer.appendChild(post.getElement());
}


function addPosts(pageIdx) {
    currentPage = pageIdx;

    const startRange = (pageIdx - 1) * postIncrease;
    const endRange = currentPage == pageCount
        ? postLimit
        : pageIdx * postIncrease;

    postCountElem.innerHTML = endRange;

    for (let i = startRange + 1; i <= endRange; i++) {
        createPost();
    }
}


function handleInfiniteScroll() {
    throttle(() => {
        const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

        if (endOfPage) {
            addPosts(currentPage + 1);
        }

        if (currentPage === pageCount) {
            removeInfiniteScroll();
        }
    }, 1000);
}


// limit how often we try to load new posts to maintain browser performance
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

addPosts(currentPage);
window.addEventListener("scroll", handleInfiniteScroll);

// TODO: define the limit of the content to be loaded on the page
// TODO: detect when the user has reached the end of the content container
// TODO: load more content once the end of the container has been reached
// TODO: if there's no more content to be loaded, stop the infinite scroll
