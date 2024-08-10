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

const postingStyles = [
    "Sometimes gets over excited and replies in ALL CAPS",
    "Posts jokes exclusively. Always posts jokes. Replies are usually quite funny and witty. Does not ever ask questions",
    "Posts exactly what is on their mind at any given time, usually not related to anything. Replies are a little bit more focused, but still not entirely on topic",
    "Aggressively tries to relate everything to an unrelated hobby",
    "Types in a rush so ends up making lots of spelling mistakes. At least two spelling mistakes in every reply.",
    "Constantly brings up a major life achievement, every reply mentions this milestone.",
    "Incredibly sarcastic in every single reply. Always sarcastic. Reply must be sarcastic.",
    "Is a little bit horny all the time. Posts are ever so slightly sexually suggestive. Always flirts given the opportunity",
    "Always PUMPED UP, replies use lots of CAPITAL LETTERS and communicate how excited the user is. Lots of capital letters.",
    "Quick to anger, likes to antagonise. Very negative. Replies from this user do not ever say anything positive. Ever.",
    "Always plays devil's advocate. Replies from this user always go against what the original post said."
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
const loader = document.getElementById("loader");

// some state
var isWritingPost = false;
var isWritingReply = false;

// define a variable for how many posts we want to increase the page by
const postIncrease = 9;
// and define a value to determine which page we're on
let currentPage = 1;

// how many times can we increase the content until we reach the max limit?
function getPageCount() {
    return Math.ceil(Object.keys(posts).length / postIncrease);
}

class Icon {
    constructor(id, imagePath, callback) {
        this.id = id;
        this.imagePath = imagePath;
        this.callback = callback;

        this.isActive = false;
    }

    setActive(newValue) {
        this.isActive = newValue;

        const elem = document.getElementById(this.id);
        if (this.isActive) {
            elem.className = "icon active";
        } else {
            elem.className = "icon";
        }
    }

    setImage(path) {
        const imgElem = document.getElementById(this.id)
            .getElementsByClassName("icon-img")[0];
        imgElem.setAttribute("src", path);
    }

    getElement() {
        const elem = document.createElement("div");
        elem.id = this.id;
        elem.className = "icon";

        const imgElem = document.createElement("img");
        imgElem.className = "icon-img";
        imgElem.setAttribute("src", this.imagePath);
        elem.appendChild(imgElem);

        const countElem = document.createElement("span");
        countElem.className = "icon-count";
        const count = Math.floor(1000 + Math.random() * 9000);
        countElem.innerHTML = count;
        elem.appendChild(countElem);

        elem.addEventListener("click", () => {
            this.callback(this);
        });

        return elem;
    }

    incrementCount() {
        this.modifyCount(1);
    }
    decrementCount() {
        this.modifyCount(-1);
    }

    modifyCount(amount) {
        // get count element
        const countElem = document.getElementById(this.id)
            .getElementsByClassName("icon-count")[0];

        // read the number out of it
        let number = parseInt(countElem.innerHTML);

        number += amount;

        // put the number back
        countElem.innerHTML = number;
    }
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
        return this.getPostLevel() == 0 ? "h1" : "h2";
    }

    getHeaderElement() {
        const elem = document.createElement("div");
        elem.className = "post-header";

        // TODO: fetch current user pfp from thispersondoesnotexist and place in local storage
        // for now if this person is us, post octopus
        const currentUser = getCurrentUser();
        const isCurrentUser = this.username == currentUser.user;
        const pfpPath = isCurrentUser ? "https://thispersondoesnotexist.com/" : `user/${this.username}.png`;

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

        const imgElem = document.createElement("img");
        imgElem.className = "icon-img";
        imgElem.setAttribute("src", svg);
        elem.appendChild(imgElem);

        const countElem = document.createElement("span");
        countElem.className = "icon-count";
        countElem.innerHTML = count;
        elem.appendChild(countElem);

        return elem;
    }

    getFooterElement() {
        const elem = document.createElement("div");
        elem.className = "post-footer";

        const getToggleCallback = (activeImg, inactiveImg) => {
            const toggle = icon => {
                if (icon.isActive) {
                    icon.setActive(false);
                    icon.setImage(inactiveImg);
                    icon.decrementCount();
                } else {
                    icon.setActive(true);
                    icon.setImage(activeImg);
                    icon.incrementCount();
                }
            };
            return toggle;
        }

        const star = new Icon(
            `${this.id}-star`,
            "icon/star-regular.svg",
            getToggleCallback("icon/star-solid.svg", "icon/star-regular.svg"));
        const repost = new Icon(
            `${this.id}-repost`,
            "icon/retweet-solid.svg",
            icon => icon.incrementCount());
        const bookmark = new Icon(
            `${this.id}-bookmark`,
            "icon/bookmark-regular.svg",
            getToggleCallback("icon/bookmark-solid.svg", "icon/bookmark-regular.svg"));
        const comment = new Icon(
            `${this.id}-comment`,
            "icon/comment-regular.svg",
            icon => {
                writeReply(this);
                icon.incrementCount();
            });

        if (this.username != getCurrentUser().user) {
            elem.appendChild(comment.getElement());
        }
        elem.appendChild(star.getElement());
        elem.appendChild(repost.getElement());
        elem.appendChild(bookmark.getElement());

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
        "posting_style": localUser.postingStyle
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
    return `write something ${getAdjective()}.`;
}

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
    advanceButtonElem.innerHTML = "enter.";
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
    const leftToChoose = maxInterests - numChosenInterests;
    if (leftToChoose > 1)
        return `choose ${leftToChoose} interests.`;

    return "choose 1 interest.";
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
            localUser.postingStyle = postingStyles[Math.floor(Math.random() * postingStyles.length)];
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

function shuffle(array) {
    let idx = array.length;

    while (idx != 0) {
        const r = Math.floor(Math.random() * idx);
        idx--;

        [array[idx], array[r]] = [array[r], array[idx]];
    }
}

const usersUrl = localMode ? "users.json" : "https://api.wayfarer.games/singularity/users.json";
const postsUrl = localMode ? "posts.json" : "https://api.wayfarer.games/singularity/posts.json";
loadDataFromEndpoint(usersUrl, json => { users = json.users; });
loadDataFromEndpoint(postsUrl, json => {

    let postsData = json.content;
    shuffle(postsData);

    // first pass to instantiate all the posts
    for (let i = 0; i < postsData.length; i++) {
        const post = new Post(postsData[i]);
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
});

if (!showSplash) {
    removeSplash();
}
