var users = [];
var posts = {};

const adjectives = [
    "dynamic", "strategic", "innovative", "passionate", "results-oriented",
    "proactive", "visionary", "collaborative", "driven", "empathetic",
    "adaptable", "resilient", "resourceful", "detail-oriented", "inspirational",
    "analytical", "motivated", "solution-focused", "committed", "agile"
];

const interests = [
    "music", "comedy", "travel", "technology", "hiking", "nature", "food", "movies",
    "culture", "art", "activism", "community", "books", "baking", "creativity", "fitness",
    "fashion", "wellness", "history", "adventure", "gaming", "gardening", "sustainability",
    "coding", "coffee", "DIY", "crafts", "pets", "animals", "humor", "languages", "sports",
    "competition", "meditation", "mindfulness", "design", "concerts", "innovation", "museums",
    "future", "writing", "relaxation", "photography", "compassion", "nutrition", "style",
    "restaurants", "gadgets", "inspiration", "literature", "outdoors", "wildlife", "conservation",
    "motivation", "beauty", "culinary arts", "festivals", "exploration", "knowledge", "camping",
    "archeology", "triathlon", "endurance", "luxury", "wine", "fine dining", "audio equipment",
    "sound quality", "startups", "entrepreneurship", "extreme sports", "philosophy", "survival",
    "environment", "politics", "running", "gastronomy", "genres", "software", "current events",
    "recipes", "listening", "discovery", "expression", "reading", "recommendations", "news",
    "analysis", "trends", "dining", "reviews", "rescue", "welfare", "health", "artists", "cooking"
];

var localUser = {
    user: null,
    interests: [],
    postingStyle: null
};
var splashStep = 0;
const maxInterests = 3;

// configuration
const localMode = false;
const showSplash = false;

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

class Post {
    // JSON post data
    constructor(data) {
        this.id = data.id;
        this.username = data.associatedUser;
        this.content = data.body;
        this.replyTo = data.replyTo;
        this.parentPost = null;

        this.stars = 420;

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
        return this.getPostLevel() == 0 ? "h1" : "h2";
    }

    getHeaderElement() {
        const elem = document.createElement("div");
        elem.className = "post-header";

        // TODO: fetch current user pfp from thispersondoesnotexist and place in local storage
        // for now if this person is us, post octopus
        const currentUser = getCurrentUser();
        const isCurrentUser = this.username == currentUser.user;
        const pfpPath = isCurrentUser ? "oct.jpg" : `user/${this.username}.png`;

        const pfpElem = document.createElement("img");
        pfpElem.setAttribute("src", pfpPath);
        pfpElem.setAttribute("class", "pfp");
        elem.appendChild(pfpElem);

        const usernameElem = document.createElement(this.getHeaderTag());
        usernameElem.setAttribute("class", "username");
        usernameElem.innerHTML = `<a href="#">${this.username}</a>`;
        elem.appendChild(usernameElem);

        return elem;
    }

    getContentElement() {
        const elem = document.createElement("p");
        elem.innerHTML = this.content;


        return elem;
    }

    getIconElement(svg, right) {
        const elem = document.createElement("div");
        elem.className = "icon";
        right *= 15;
        elem.style.right = `${right}vw`;

        const imgElem = document.createElement("img");
        imgElem.className = "icon-img";
        imgElem.setAttribute("src", svg);
        elem.appendChild(imgElem);

        const countElem = document.createElement("span");
        // TODO: make an icon class to store count OR i guess just parse it out of the DOM
        countElem.className = "icon-count";
        countElem.innerHTML = "42069";
        elem.appendChild(countElem);

        return elem;
    }

    getFooterElement() {
        const elem = document.createElement("div");
        elem.className = "post-footer";

        const starIconElem = this.getIconElement("icon/star-regular.svg", 0);
        elem.appendChild(starIconElem);

        const repostElem = this.getIconElement("icon/retweet-solid.svg", 1)
        elem.appendChild(repostElem);

        const bookmarkElem = this.getIconElement("icon/bookmark-regular.svg", 2);
        elem.appendChild(bookmarkElem);

        const commentElem = this.getIconElement("icon/comment-regular.svg", 3);
        commentElem.addEventListener("click", () => writeReply(this));
        elem.appendChild(commentElem);

        return elem;
    }

    getElement() {
        const elem = document.createElement("div");
        elem.id = this.id;

        // display root posts as blocks, and comments as attached to their posts
        let classes = ["post"];
        if (this.getPostLevel() == 0) {
            classes.push("block");
        }
        elem.className = classes.join(" ");
        elem.appendChild(this.getHeaderElement());
        elem.appendChild(this.getContentElement());
        elem.appendChild(this.getFooterElement());

        for (let i = 0; i < this.replies.length; i++) {
            const reply = this.replies[i];
            elem.appendChild(reply.getElement());
        }

        return elem;
    }
}


function getAdjective() {
    return adjectives[Math.floor(Math.random() * adjectives.length)];
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
    // return some default values if we didn't do the initial configuration 
    if (!showSplash) {
        return {
            "user": "ktyl",
            "interests": ["trains", "trains", "trains"],
            "posting_style": "borderline maniacal train content"
        };
    }

    return {
        "user": localUser.user,
        "interests": localUser.interests,
        "posting_style": "just the most truly inane takes"
    };
}

function getPostRequest(body) {
    return {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(body),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    };
}

function getLoaderIcon() {
    const elem = document.createElement("div");
    elem.className = "loader-icon";
    return elem;
}

function getWritePostButtonText() {
    return `Write something ${getAdjective()} for me!`;
}

var isWritingPost = false;
var isWritingReply = false;

function writePost() {
    if (isWritingPost)
        return;

    if (localMode) {
        const post = new Post({
            id: "1234",
            associatedUser: getCurrentUser().user,
            body: "local mode post (local mode post)"
        });
        blockContainer.insertBefore(post.getElement(), getTopPost());
        return;
    } 

    // change the content of the write post button to a loading animation
    const buttonContent = document.getElementById("write-post-button-content");
    buttonContent.innerHTML = "";
    buttonContent.appendChild(getLoaderIcon());
    isWritingPost = true;

    fetch("https://api.wayfarer.games/singularity/generate-posts.php", getPostRequest(getCurrentUser()))
        .then(response => response.json())
        .then(makePostFromJson)
        .then(post => {
            isWritingPost = false;
            blockContainer.insertBefore(post.getElement(), getTopPost());
            buttonContent.innerHTML = getWritePostButtonText();
        });
}

function writeReply(post) {
    if (isWritingReply)
        return;

    // find the correct element
    const elem = document.getElementById(post.id);
    const user = getCurrentUser();

    if (localMode) {
        console.error("TODO: implement local replies");
        return;
    }

    const replyBody = {
        postId: post.id,
        interests: user.interests,
        user: user.user,
        posting_style: user.posting_style
    };
    isWritingReply = true;
    const request = getPostRequest(replyBody);

    // add a loading icon to the element
    const loader = getLoaderIcon();
    elem.append(loader);

    fetch("https://api.wayfarer.games/singularity/generate-reply.php", getPostRequest(replyBody))
        .then(response => response.json())
        .then(makePostFromJson)
        .then(reply => {
            isWritingReply = false;
            post.addReply(reply);
            elem.append(reply.getElement());
            loader.remove();
        });
}
function addWritePostBlock() {
    const blockElem = document.createElement("div");
    blockElem.addEventListener("click", writePost);
    blockElem.className = "block write-post";

    const contentElem = document.createElement("h1");
    contentElem.className = "";
    contentElem.id = "write-post-button-content";
    contentElem.innerHTML = getWritePostButtonText();
    blockElem.append(contentElem);

    blockContainer.append(blockElem);
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


function chooseInterest(interest) {
    if (localUser.interests.length == maxInterests) {
        console.error(`can't choose more than ${maxInterests} interests`);
        return;
    }

    localUser.interests.push(interest);

    const interestsTextElem = document.getElementById("interests-text");

    if (localUser.interests.length != maxInterests) {
        interestsTextElem.innerHTML = getInterestsTextValue(localUser.interests.length);
        return;
    }

    const advanceButtonElem = document.getElementById("advance-button");
    advanceButtonElem.innerHTML = "Begin!";
    advanceButtonElem.style.visibility = "visible";

    interestsTextElem.remove();
    const interestsListElem = document.getElementById("interest-selection");
    interestsListElem.remove();
}

function getInterestsSubset() {
    const count = 20;
    let subset = [];

    while (subset.length < count) {
        const interest = interests[Math.floor(Math.random() * interests.length)];

        // skip if it's already included
        if (subset.includes(interest))
            continue;

        // skip if the user has already chosen it
        if (localUser.interests.includes(interest))
            continue;

        subset.push(interest);
    }

    return subset;
}

function populateSplashInterests() {

    const rootElem = document.getElementById("interest-selection");
    if (rootElem == null)
        return;

    // clear existing interests
    rootElem.innerHTML = "";

    const interestsSubset = getInterestsSubset();

    for (let i = 0; i < interestsSubset.length; i++) {
        const interest = interestsSubset[i];
        const listItemElem = document.createElement("li");
        rootElem.appendChild(listItemElem);

        const buttonElem = document.createElement("a");
        buttonElem.innerHTML = `#${interest}`;
        buttonElem.addEventListener("click", () => {
            chooseInterest(interest);
            populateSplashInterests();
        });
        listItemElem.appendChild(buttonElem);
    }
}

function getInterestsTextValue(numChosenInterests) {
    return `Choose some interests! (${numChosenInterests}/${maxInterests})`;
}

function usernameInputUpdated(event) {
    const inputElem = document.getElementById("username");
    const buttonElem = document.getElementById("advance-button");
    const isNameEmpty = inputElem.value.length == "";
    buttonElem.style.visibility = isNameEmpty ? "hidden" : "visible";

    if (isNameEmpty)
        return;

    if (event.key == "Enter") {
        advanceSplash();
    }
}

function chooseName() {
    // check that a name has been chosen
    const inputElem = document.getElementById("username");
    if (!inputElem.value) {
        console.error("a name needs to be entered!");
        return;
    }

    splashStep = 1;
    localUser.user = inputElem.value;

    const splashElem = document.getElementById("start-splash");

    const interestsTextElem = document.createElement("p");
    interestsTextElem.innerHTML = getInterestsTextValue(0);
    interestsTextElem.id = "interests-text";
    interestsTextElem.className = "center";
    splashElem.insertBefore(interestsTextElem, inputElem);

    const interestsListElem = document.createElement("ul");
    interestsListElem.className = "center";
    interestsListElem.id = "interest-selection";
    splashElem.insertBefore(interestsListElem, inputElem);

    populateSplashInterests();

    // remove name input
    inputElem.remove();

    const advanceButtonElem = document.getElementById("advance-button");
    advanceButtonElem.style.visibility = "hidden";

    splashStep = 1;
}

function chooseInterests() {
    if (localUser.interests.length < maxInterests) {
        console.error(`need to choose ${maxInterests} interests`);
        return;
    }

    console.log("TODO: generate user posting style");
}

function removeSplash() {
    document.getElementById("start-splash").remove();
}

function advanceSplash() {
    switch(splashStep) {
        case 0:
            chooseName();
            break;
        case 1:
            chooseInterests();
            removeSplash();
            break;
        default:
            console.error(`nothing defined for splash step ${splashStep}`);
    }
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

if (!showSplash) {
    removeSplash();
}
