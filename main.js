var users = [];
var posts = {};

const localMode = true;
const blockContainer = document.getElementById("block-container");
const postCountElem = document.getElementById("post-count");
const postTotalElem = document.getElementById("post-total");
const loader = document.getElementById("loader");

// define a variable for how many posts we want to increase the page by
const postIncrease = 9;
// and define a value to determine which page we're on
let currentPage = 1;

// how many times can we increase the content until we reach the max limit?
function getPageCount() {
    return Math.ceil(Object.keys(posts).length / postIncrease);
}

function getRandomColor() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}deg, 90%, 85%)`;
}

class Post {
    // JSON post data
    constructor(data) {
        this.id = data.id;
        this.username = data.associatedUser;
        this.content = data.body;
        this.replyTo = data.replyTo;
        this.parentPost = null;

        this.replies = [];
    }

    getIsReply() {
        return this.replyTo != "";
    }

    addReply(reply) {
        this.replies.push(reply);
        reply.parentPost = this;
    }

    getPostLevel() {
        let p = this.parentPost;
        let depth = 0;
        while (p != null) {
            p = p.parentPost;
            depth++;
        }
        return depth;
    }

    getHeaderTag() {
        const level = this.getPostLevel();
        switch (level) {
            case 0: return "h1";
            case 1: return "h2";
            case 2: return "h3";
            case 3: return "h4";
            default:
                console.error(`${level} is not a supported post level`);
                return null;
        }
    }

    getHeaderElement() {
        const headerElem = document.createElement(this.getHeaderTag());
        headerElem.innerHTML = this.username;

        const elem = document.createElement("a");
        elem.setAttribute("href", "#");
        elem.addEventListener("click", () => updateUserProfile(this.username));
        elem.appendChild(headerElem);

        return elem;
    }

    getContentElement() {
        const elem = document.createElement("p");
        elem.innerHTML = this.content;
        return elem;
    }

    getElement() {
        const elem = document.createElement("div");

        // display root posts as blocks, and comments as attached to their posts
        if (this.getPostLevel() == 0) {
            elem.className = "block post";
        }
        elem.style.backgroundColor = getRandomColor();
        elem.appendChild(this.getHeaderElement());
        elem.appendChild(this.getContentElement());

        for (let i = 0; i < this.replies.length; i++) {
            const reply = this.replies[i];
            elem.appendChild(reply.getElement());
        }

        return elem;
    }
}


function getRootPosts() {
    let result = [];
    for (var id in posts) {
        const post = posts[id];
        if (post.getIsReply())
            continue;

        result.push(post);
    }
    return result;
}


function addPosts(pageIdx) {
    currentPage = pageIdx;

    const startRange = (pageIdx - 1) * postIncrease;
    const endRange = currentPage == getPageCount()
        ? posts.length
        : pageIdx * postIncrease;

    postCountElem.innerHTML = endRange;

    const rootPosts = getRootPosts();

    for (let i = startRange + 1; i <= endRange; i++) {
        const post = rootPosts[i];
        const elem = post.getElement();
        blockContainer.appendChild(elem);
    }
}


function handleInfiniteScroll() {
    throttle(() => {
        const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

        if (endOfPage) {
            addPosts(currentPage + 1);
        }

        if (currentPage === getPageCount()) {
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

function getTopPost() {
    // find the first post
    const children = blockContainer.childNodes;
    let firstPost = null;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const classes = child.className.split(" ");
        if (classes.some(c => c == "post")) {
            firstPost = child;
            break;
        }
    }

    return firstPost;
}

function makePostFromJson(json) {
    return new Post({
        id: json.id,
        associatedUser: json.associatedUser,
        body: json.body
    });
}

function getCurrentUser() {
    return {
        "user": "theChief",
        "interests": [
            "gen-ai",
            "blockchain",
            "nfts"
        ],
        "posting_style": "just the most truly inane takes"
    };
}

function writePost() {
    const request = {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(getCurrentUser()),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    };

    if (localMode) {
        const post = new Post({
            id: "1234",
            associatedUser: getCurrentUser().user,
            body: "local mode post (local mode post)"
        });
        blockContainer.insertBefore(post.getElement(), getTopPost());
    } else {
        fetch("https://api.wayfarer.games/singularity/generate-posts.php", request)
            .then(response => response.json())
            .then(makePostFromJson)
            .then(post => blockContainer.insertBefore(post.getElement(), getTopPost()));
    }
}

function addWritePostBlock() {
    const blockElem = document.createElement("div");
    blockElem.className = "block";
    blockElem.style.backgroundColor = "red";

    const buttonElem = document.createElement("a");
    buttonElem.setAttribute("href", "#");
    buttonElem.innerHTML = "Write something interesting for me!";
    buttonElem.addEventListener("click", writePost);
    blockElem.append(buttonElem);

    blockContainer.append(blockElem)
}

function init() {
    if (posts == undefined)
    {
        console.log("resource loading failed");
        return;
    }
    
    // need to load all the resources first
    const postCount = Object.keys(posts).length;
    if (users.length == 0 || postCount == 0)
        return;

    console.log(`loaded ${users.length} users and ${postCount} posts`);

    // TODO: add user bio above write post button
    addWritePostBlock();

    addPosts(currentPage);
    window.addEventListener("scroll", handleInfiniteScroll);
}

function loadDataFromEndpoint(endpoint, callback) {
    fetch(endpoint)
        .then(response => response.json())
        .then(json => {
            callback(json);
            init();
        });
}

const usersUrl = localMode ? "users.json" : "https://api.wayfarer.games/singularity/users.json";
const postsUrl = localMode ? "posts.json" : "https://api.wayfarer.games/singularity/posts.json";
loadDataFromEndpoint(usersUrl, json => { users = json.users; });
loadDataFromEndpoint(postsUrl, json => {
    // first pass to instantiate all the posts
    for (let i = 0; i < json.content.length; i++) {
        const post = new Post(json.content[i]);
        posts[post.id] = post;
    }

    // second pass to link each reply to the appropriate parent
    for (const id in posts) {
        const post = posts[id];
        if (!post.getIsReply())
            continue;

        const parent = posts[post.replyTo];
        parent.addReply(post);
    }

    postTotalElem.innerHTML = Object.keys(posts).length;
});
