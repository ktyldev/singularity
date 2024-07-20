var users = [];
var posts = {};

const blockContainer = document.getElementById("block-container");
const postCountElem = document.getElementById("post-count");
const postTotalElem = document.getElementById("post-total");
const loader = document.getElementById("loader");

// then we'll define a variable for how many posts we want to increase the
// page by
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
        postElem.className = "block post";
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
    const endRange = currentPage == getPageCount()
        ? posts.length
        : pageIdx * postIncrease;

    postCountElem.innerHTML = endRange;

    const rootPosts = getRootPosts();

    for (let i = startRange + 1; i <= endRange; i++) {
        blockContainer.appendChild(rootPosts[i].getElement());
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

function writePost() {
    // TODO: inject a new post element at the top of the feed
    console.log("write something interesting");

    setTimeout(() => {
    }, 500);

    const userName = "theChief";
    fetch("https://api.wayfarer.games/singularity/generate-posts.php", {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
            "user": userName,
            "interests": [
                "gen-ai",
                "blockchain",
                "nfts"
            ],
            "posting_style": "just the most truly inane takes"
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
        .then(response => response.json())
        .then(json => {
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
            console.log(firstPost);

            // generate a post to insert before the first post
            const postData = {
                id: json.id,
                associatedUser: json.associatedUser,
                body: json.body
            };

            const post = new Post(postData);
            const postElem = post.getElement();

            blockContainer.insertBefore(postElem, firstPost);

            console.log(post);
        });
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

    // TODO: add write post block
    addWritePostBlock();
    // TODO: add bio

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

loadDataFromEndpoint("https://api.wayfarer.games/singularity/users.json", json => { users = json.users; });
loadDataFromEndpoint("https://api.wayfarer.games/singularity/posts.json", json => {
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
