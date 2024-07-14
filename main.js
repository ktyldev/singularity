var users = [];
var posts = {};

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
    const r = Math.floor(Math.random() * users.length);
    return users[r].username;
}


function getContent(username) {
    let user = null;
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == username) {
            user = users[i];
            break;
        }
    }

    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
}


class Post {
    constructor(data) {
        this.id = data.id;
        this.username = data.associatedUser;
        this.content = data.body;
        this.replyTo = data.replyTo;

        this.replies = []
    }

    getIsReply() {
        return this.replyTo != "";
    }

    addReply(reply) {
        this.replies.push(reply);
    }

    getElement() {
        const postElem = document.createElement("div");
        postElem.className = "post";
        postElem.style.backgroundColor = getRandomColor();

        // add a header to the post
        const headerElem = document.createElement("h1");
        headerElem.innerHTML = this.username;

        const profileLinkElem = document.createElement("a");
        profileLinkElem.setAttribute("href", "#");
        profileLinkElem.addEventListener("click", () => updateUserProfile(this.username));
        profileLinkElem.appendChild(headerElem);

        postElem.appendChild(profileLinkElem);

        const contentElem = document.createElement("p");
        contentElem.innerHTML = this.content;
        postElem.appendChild(contentElem);

        for (let i = 0; i < this.replies.length; i++) {
            const reply = this.replies[i];

            const commentElem = document.createElement("div");
            commentElem.style.backgroundColor = getRandomColor();

            const commentUserElem = document.createElement("h2");
            commentUserElem.innerHTML = reply.username;
            commentElem.appendChild(commentUserElem);

            const commentContentElem = document.createElement("p");
            commentContentElem.innerHTML = reply.content;
            commentElem.appendChild(commentContentElem);

            postElem.appendChild(commentElem);

            // TODO: indent 2nd-level replies
            for (let j = 0; j < reply.replies.length; j++) {
                const replyReply = reply.replies[j];

                const replyReplyElem = document.createElement("div");
                replyReplyElem.style.backgroundColor = getRandomColor();

                const replyReplyUserElem = document.createElement("h3");
                replyReplyUserElem.innerHTML = replyReply.username;
                replyReplyElem.appendChild(replyReplyUserElem);

                const replyReplyContentElem = document.createElement("p");
                replyReplyContentElem.innerHTML = replyReply.content;
                replyReplyElem.appendChild(replyReplyContentElem);

                postElem.appendChild(replyReplyElem);
            }
        }

        return postElem;
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
    const endRange = currentPage == pageCount
        ? postLimit
        : pageIdx * postIncrease;

    postCountElem.innerHTML = endRange;

    const rootPosts = getRootPosts();
    console.log(rootPosts);

    for (let i = startRange + 1; i <= endRange; i++) {
        postContainer.appendChild(rootPosts[i].getElement());
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

function init() {
    if (posts == undefined)
    {
        console.log("resource loading failed");
        return;
    }
    
    // need to load all the resources first
    if (users.length == 0 || Object.keys(posts).length == 0)
        return;

    console.log(`loaded ${users.length} users and ${posts.length} posts`);

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

loadDataFromEndpoint("users.json", json => { users = json.users; });
loadDataFromEndpoint("posts.json", json => { 
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
});
