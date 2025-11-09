// Selectors
const postsContainer = document.querySelector(".posts");
const liveAlertPlaceholder = document.getElementById("liveAlertPlaceholder");
const loginBtn = document.getElementById("liveAlertBtn");
const regAlertBtn = document.getElementById("registerAlert");
const navlogBtn = document.querySelector(".login-btn");
const registerBtn = document.querySelector(".register-btn");
const logoutBtn = document.querySelector(".loggedout-btn");
const modalEl = document.getElementById("login");
const regModal = document.getElementById("register");
const createBtn = document.querySelector(".create-post");
const createPostModal = document.getElementById("create-post");
const createPostBtn = document.getElementById("create-button");
const targetPostContainer = document.querySelector(".target-post");
const editPostModal = document.getElementById("edit");
const editPostBtn = document.getElementById("edit-post");
const deletePostModal = document.getElementById("delete");
const deletePostBtn = document.getElementById("post-delete");
const profilePosts = document.querySelector(".profile-posts");
const scrollTopBtn = document.querySelector(".scroll-top");

// Default Data
let counter = 1;

// Check Local Storage On Loading The Page
window.onload = async function () {
  if (window.localStorage.getItem("token")) {
    loggedIn(JSON.parse(window.localStorage.getItem("user")));
    // Check The Owner Of Profile To Handle Add New Post Feature
    if (window.localStorage.getItem("profilePost")) {
      let loggenUserData = JSON.parse(window.localStorage.getItem("user"));
      let anyUserData = JSON.parse(window.localStorage.getItem("profilePost"));
      if (loggenUserData.username === anyUserData.author.username) {
        if (createBtn) {
          createBtn.classList.add("show");
        }
      } else {
        if (createBtn) {
          createBtn.classList.remove("show");
        }
      }
    }
  } else {
    // Check If It's Not User LoggedIn Hide Show My Profile Feature
    document.getElementById("profile").classList.add("hide");
  }
  if (window.localStorage.getItem("id") && targetPostContainer) handlePostClicked(JSON.parse(window.localStorage.getItem("id")));
  if (window.localStorage.getItem("profilePost")) {
    showProfilePage(JSON.parse(window.localStorage.getItem("profilePost")), false);
  } else {
    showProfilePage(JSON.parse(window.localStorage.getItem("user")), true);
  }
};

// Function Get Posts From Api
async function getPosts(counter) {
  loader(true);
  try {
    const response = await axios.get(`https://tarmeezacademy.com/api/v1/posts?limit=5&page=${counter}`);
    const posts = response.data.data;
    if (posts.length > 0) {
      for (let post of posts) {
        await postContent(post);
      }
    } else {
      appendAlert("Stop Scrolling No Posts To Show", "danger", "exclamation");
      hideAlert();
      window.onscroll = null;
    }
  } catch (error) {
    console.error("Error loading posts:", error);
  } finally {
    loader(false);
  }
  showPost();
  if (window.localStorage.getItem("user")) {
    await checkPostOwner(JSON.parse(window.localStorage.getItem("user")).id);
  }
}

getPosts(counter);

// Handle Scrooling In App
let loading = false;
window.onscroll = async function () {
  // Activate Pagination
  if (postsContainer) {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (!loading) {
        loading = true;
        counter++;
        await getPosts(counter);
        loading = false;
      }
    }
  }

  // Activate Scroll To Top Feature
  if (window.scrollY >= 800) {
    scrollTopBtn.classList.add("found");
  } else {
    scrollTopBtn.classList.remove("found");
  }
  goUp();
};

// Function Create The Post Body
async function postContent(obj) {
  let post = `
          <div class="post bg-light p-3 rounded shadow-sm mb-4" data-postid=${obj.id} data-userid=${obj.author.id}>
              <div class="
                  header d-flex align-items-center justify-content-between 
                  pb-2 mb-3 border-bottom border-secondary-emphasis
                ">
                <div class="activate-profile" onclick="getTargetInfo('${encodeURIComponent(JSON.stringify(obj))}')">
                  <img class="user-img" src="${
                    typeof obj.author.profile_image === "object" ? "./imgs/avatar.png" : obj.author.profile_image
                  }" alt="user" onerror="src='./imgs/avatar.png'"/>
                  <span class="username fw-medium">${obj.author.username}</span>
                </div>
                <div class="post-controls"></div>
              </div>
              <div class="content">
                <div class="img-container text-center rounded">
                ${checkImage(obj)}
                </div>
                <span class="time mt-2 d-block text-secondary fw-semibold">${obj.created_at}</span>
                <div class="edit-area  mb-3 pb-1 border-bottom border-secondary-emphasis">
                <h4 class="post-title mt-2 mb-2">${obj.title === null ? "" : obj.title}</h4>
                <p class="post-body mt-2 fw-medium">${obj.body}</p>
              </div>
              <div class="post-footer d-flex align-items-center gap-1 flex-wrap">
                <i class="fa-solid fa-pen-clip"></i>
                <span>(${obj.comments_count})</span>
                <span>Comments</span>
                ${getPostTags(obj.tags)}
              </div>
          </div>
  `;
  if (postsContainer) {
    postsContainer.innerHTML += post;
  }
}

// Function Check The Image In Post
function checkImage(obj) {
  let temp = document.createElement("div");
  if (typeof obj.image !== "object") {
    let img = document.createElement("img");
    img.setAttribute("onerror", "src='./imgs/avatar.png'");
    img.alt = "Post-Image";
    img.src = obj.image;
    img.className = "mw-100 rounded";
    temp.appendChild(img);
    return temp.innerHTML;
  } else {
    return "";
  }
}

// Function Append Tags Based On Number Of Them In Each Post
function getPostTags(tags) {
  let tagsContainer = document.createElement("div");
  for (let tag of tags) {
    let span = document.createElement("span");
    span.className = "tag text-light bg-secondary rounded-5";
    span.appendChild(document.createTextNode(tag.name));
    tagsContainer.appendChild(span);
  }
  return tagsContainer.innerHTML;
}

// Handle Modal Before Starting To Hide
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("hide.bs.modal", () => {
    if (document.activeElement) document.activeElement.blur();
  });
});

// Handle User Login
loginBtn.onclick = function () {
  loader(true);
  let usernameValue = document.querySelector(".username-value").value;
  let passwordValue = document.querySelector(".password-value").value;
  let params = {
    username: usernameValue,
    password: passwordValue,
  };
  axios
    .post("https://tarmeezacademy.com/api/v1/login", params)
    .then((response) => {
      window.location = "index.html";
      window.localStorage.setItem("token", response.data.token);
      window.localStorage.setItem("user", JSON.stringify(response.data.user));
      appendAlert("You Have Successfully Logged In", "success", "check");
      hideAlert();
      bootstrap.Modal.getInstance(modalEl).hide();
      if (postsContainer) {
        postsContainer.innerHTML = "";
        getPosts(counter);
      }
      loggedIn(response.data.user);
    })
    .catch((error) => console.log(error.message))
    .finally(() => loader(false));
};

// Handle User Registering
regAlertBtn.onclick = function () {
  let nameValue = document.getElementById("reg-name").value;
  let usernameValue = document.getElementById("reg-username").value;
  let passwordValue = document.getElementById("reg-password").value;
  let img = document.getElementById("reg-image").files[0];

  const regFormData = new FormData();
  regFormData.append("name", nameValue);
  regFormData.append("username", usernameValue);
  regFormData.append("password", passwordValue);
  if (img) {
    formData.append("image", img);
  }
  loader(true);
  axios
    .post("https://tarmeezacademy.com/api/v1/register", regFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      window.location = "index.html";
      window.localStorage.setItem("token", response.data.token);
      window.localStorage.setItem("user", JSON.stringify(response.data.user));
      appendAlert("New User Registered Successfully", "success", "check");
      hideAlert();
      bootstrap.Modal.getInstance(regModal).hide();
      loggedIn(response.data.user);
    })
    .catch((error) => {
      appendAlert(error.response.data.message, "danger", "exclamation");
      hideAlert();
    })
    .finally(() => loader(false));
};

// Function Create Custom Alert To The User
function appendAlert(message, type, iconClass) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible m-0 tr" role="alert">
         <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-circle-${iconClass}"></i>
            <span>${message}</span>
         </div>
         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  liveAlertPlaceholder.appendChild(wrapper);
}

// Function Handle The Disapper Of Alert After Duration
function hideAlert() {
  setTimeout(() => {
    liveAlertPlaceholder.innerHTML = "";
  }, 3000);
}

// Function Handle The Page When User Is Logged In
function loggedIn(obj) {
  navlogBtn.classList.add("hide");
  registerBtn.classList.add("hide");
  logoutBtn.classList.remove("hide");
  if (createBtn) createBtn.classList.add("show");
  let userData = document.createElement("div");
  userData.classList.add("user-data", "mr-10");
  let userImg = document.createElement("img");
  userImg.src = typeof obj.profile_image === "object" ? "" : obj.profile_image;
  userImg.alt = "user";
  userImg.classList.add("user-img", "mr-10");
  userData.appendChild(userImg);
  let userName = document.createElement("span");
  userName.appendChild(document.createTextNode(obj.username));
  userData.appendChild(userName);
  logoutBtn.before(userData);
  commentsFeature();
  document.getElementById("profile").classList.remove("hide");
}

// Function Handle User Logging Out
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("loggedout-btn")) {
    window.location = "index.html";
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    loggedOut();
    appendAlert("You Have Successfully Logged Out", "danger", "xmark");
    if (postsContainer) {
      postsContainer.innerHTML = "";
      getPosts(counter);
    }
    hideAlert();
  }
});

// Logged Out Function To Handle The Page
function loggedOut() {
  document.querySelector(".user-data").remove();
  navlogBtn.classList.remove("hide");
  registerBtn.classList.remove("hide");
  logoutBtn.classList.add("hide");
  document.getElementById("profile").classList.add("hide");
  if (createBtn) createBtn.classList.remove("show");
  commentsFeature();
  if (targetPostContainer) {
    targetPostContainer.classList.remove("for-me");
  }
}

// Function Create New Post
function createPost() {
  if (createPostBtn) {
    createPostBtn.onclick = function () {
      loader(true);
      const title = document.getElementById("post-title").value;
      const body = document.getElementById("post-body").value;
      const image = document.getElementById("post-image").files[0];

      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      if (image) {
        formData.append("image", image);
      }

      axios
        .post("https://tarmeezacademy.com/api/v1/posts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          appendAlert("New Post Created Successfully", "success", "check");
          hideAlert();
          bootstrap.Modal.getInstance(createPostModal).hide();
          window.location.reload();
        })
        .catch((error) => {
          appendAlert(error.response.data.message, "danger", "exclamation");
          hideAlert();
        })
        .finally(() => loader(false));
    };
  }
}

createPost();

// Handle Clicked On Post
function showPost() {
  let posts = document.querySelectorAll(".post-footer");
  posts.forEach((post) => {
    post.addEventListener("click", function () {
      window.localStorage.setItem("id", this.parentElement.parentElement.dataset.postid);
      window.location.href = `./post.html?id=${this.parentElement.parentElement.dataset.postid}`;
    });
  });
}

// Get Clicked Post
async function handlePostClicked(id) {
  loader(true);
  try {
    const response = await axios.get(`https://tarmeezacademy.com/api/v1/posts/${id}`);
    const post = response.data.data;
    await createPostPage(post);
    if (window.localStorage.getItem("user") && window.localStorage.getItem("id") && targetPostContainer) {
      if (targetPostContainer.getAttribute("data-userid") == JSON.parse(window.localStorage.getItem("user")).id) {
        targetPostContainer.classList.add("for-me");
        document.querySelector(".for-me .post-controls").innerHTML = `
        <button class="post-delete btn btn-outline-danger fw-semibold mr-5" data-bs-toggle="modal" data-bs-target="#delete">
        <i class="fa-solid fa-trash-can"></i> Delete
        </button>
        <button class="post-edit btn btn-outline-primary fw-semibold" data-bs-toggle="modal" data-bs-target="#edit">
        <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        `;
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    loader(false);
  }
}

// Create Post Page Based On Target Post Details
async function createPostPage(obj) {
  if (targetPostContainer) {
    targetPostContainer.setAttribute("data-postid", obj.id);
    targetPostContainer.setAttribute("data-userid", obj.author.id);
    targetPostContainer.innerHTML = `
      <h1 class="post-header my-4"><span>${obj.author.username}</span>'s Post</h1>
      <div class="bg-light p-3 rounded shadow-sm mb-4" data-postid=${obj.id} data-userid=${obj.author.id}>
          <div class="
              header d-flex align-items-center justify-content-between 
              pb-2 mb-3 border-bottom border-secondary-emphasis
             ">
            <div class="activate-profile" onclick="getTargetInfo('${encodeURIComponent(JSON.stringify(obj))}')">
              <img class="user-img mr-5" src="${
                typeof obj.author.profile_image === "object" ? "./imgs/avatar.png" : obj.author.profile_image
              }" alt="user" onerror="src='./imgs/avatar.png'"/>
            <span class="username fw-medium">${obj.author.username}</span>
            </div>
            <div class="post-controls"></div>
          </div>
          <div class="content">
            <div class="img-container text-center">
              ${checkImage(obj)}
            </div>
            <span class="time mt-2 d-block text-secondary fw-semibold">${obj.created_at}</span>
            <div class="edit-area mb-3 pb-1 border-bottom border-secondary-emphasis">
                <h4 class="post-title mt-2 mb-2">${obj.title === null ? "" : obj.title}</h4>
                <p class="post-body mt-2 mb-3 fw-medium">${obj.body}</p>
            </div>
            <div class="
                post-footer d-flex align-items-center gap-1 flex-wrap 
                border-bottom border-secondary-emphasis pb-4 pointer-events-none
              ">
              <i class="fa-solid fa-pen-clip"></i>
              <span>(${obj.comments_count})</span>
              <span>Comments</span>
              ${getPostTags(obj.tags)}
            </div>
          </div>
          <div class="comments-container pt-4 d-flex flex-column gap-3">
            ${getComments(obj.comments)}
            <div class="input-group mb-3 input-group-lg new-comment-area hide">
                <input type="text" class="form-control comm-body" placeholder="Add Comment"">
                <button class="btn btn-outline-secondary" type="button" onclick="createComm()">Send</button>
            </div>
          </div>
      </div>
    `;

    // Handle The Comments Features Status
    if (window.localStorage.getItem("token")) {
      document.querySelector(".new-comment-area").classList.remove("hide");
    } else {
      document.querySelector(".new-comment-area").classList.add("hide");
    }
  }
}

// Function Loop On Comments And Append Them To Their Container
function getComments(comments) {
  let temp = document.createElement("div");
  for (let comment of comments) {
    temp.innerHTML += `
    <div class="comment d-flex flex-column gap-2 special-color p-3 rounded">
      <div class="d-flex align-items-center gap-2">
        <img class="user-img" src=${
          typeof comment.author.profile_image === "object" ? "./imgs/avatar.png" : comment.author.profile_image
        } alt="user" onerror="src='./imgs/avatar.png'"/>
        <span class="comm-user">${comment.author.username}</span>
      </div>
      <p class="m-0 comment-body">${comment.body}</p>
    </div>
  `;
  }
  return temp.innerHTML;
}

// Function Create New Comment
function createComm() {
  loader(true);
  const commentContent = document.querySelector(".comm-body").value;
  const params = {
    body: commentContent,
  };
  axios
    .post(`https://tarmeezacademy.com/api/v1/posts/${window.localStorage.getItem("id")}/comments`, params, {
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      handlePostClicked(JSON.parse(window.localStorage.getItem("id")));
      appendAlert("The Comment Created Successfully", "success", "check");
      hideAlert();
    })
    .catch((error) => {
      appendAlert(error.response.data.message, "danger", "exclamation");
      hideAlert();
    })
    .finally(() => loader(false));
}

// Handle Comments Feature To Logged In Users Only
function commentsFeature() {
  const pageParams = new URLSearchParams(window.location.search);
  const id = pageParams.get("id");
  // Means That User In Target Clicked Post New Page So Activate Feature
  if (id) {
    handlePostClicked(id);
  }
}

// ToDo: Handle Return Again From Target Post To The Same Post In Home Page

// Function Check The Post Owner Is Login User Or Not
async function checkPostOwner(userId) {
  let posts = document.querySelectorAll(".post");
  posts.forEach((post) => {
    if (post.dataset.userid == userId) {
      post.classList.add("for-me");
      document.querySelectorAll(".for-me .post-controls").forEach((post) => {
        post.innerHTML = `
        <button class="post-delete btn btn-outline-danger fw-semibold mr-5" data-bs-toggle="modal" data-bs-target="#delete">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
        <button class="post-edit btn btn-outline-primary fw-semibold" data-bs-toggle="modal" data-bs-target="#edit">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
      `;
      });
    }
  });
}

// Handle Post Editing
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("post-edit")) {
    e.target.parentElement.parentElement.parentElement.classList.add("current-target");
    window.localStorage.setItem("id", document.querySelector(".current-target").getAttribute("data-postid"));
    let title = document.getElementById("edit-title");
    let body = document.getElementById("edit-body");
    title.setAttribute("value", document.querySelector(".current-target .post-title").innerHTML);
    body.value = document.querySelector(".current-target .post-body").innerHTML;
    editPostBtn.onclick = function () {
      const formData = new FormData();
      formData.append("title", title.value);
      formData.append("body", body.value);
      formData.append("_method", "put");
      axios
        .post(`https://tarmeezacademy.com/api/v1/posts/${window.localStorage.getItem("id")}`, formData, {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          if (targetPostContainer) {
            handlePostClicked(JSON.parse(window.localStorage.getItem("id")));
          } else {
            if (postsContainer) {
              postsContainer.innerHTML = "";
              getPosts(1);
            }
            if (profilePosts) {
              window.location.reload();
            }
          }
          bootstrap.Modal.getInstance(editPostModal).hide();
          appendAlert("The Post Has Been Successfully Edited", "success", "check");
          hideAlert();
        })
        .catch((error) => console.log(error));
    };
  }
});

// Handle the deletion of posts
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("post-delete")) {
    e.target.parentElement.parentElement.parentElement.classList.add("delete-target");
    window.localStorage.setItem("id", document.querySelector(".delete-target").getAttribute("data-postid"));
    deletePostBtn.onclick = function () {
      axios
        .delete(`https://tarmeezacademy.com/api/v1/posts/${window.localStorage.getItem("id")}`, {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          if (targetPostContainer) {
            window.location = "index.html";
          } else {
            if (postsContainer) {
              postsContainer.innerHTML = "";
              getPosts(1);
            }
            if (profilePosts) {
              window.location.reload();
            }
          }
          bootstrap.Modal.getInstance(deletePostModal).hide();
          appendAlert("The Post Has Been Successfully Deleted", "success", "check");
          hideAlert();
        })
        .catch((error) => console.log(error));
    };
  }
});

// Get Current Post Clicked
function getTargetInfo(object) {
  window.location = "profile.html";
  let targetPost = JSON.parse(decodeURIComponent(object));
  window.localStorage.setItem("profilePost", JSON.stringify(targetPost));
}

// Handle Profile Page Based On Is Me Flag Is For Me As A Logged In User Or Any Other User
function showProfilePage(post, isMe) {
  if (document.querySelector(".profile")) {
    loader(true);
    axios
      .get(`https://tarmeezacademy.com/api/v1/users/${isMe && window.localStorage.getItem("user") ? post.id : post.author.id}`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        let user = response.data.data;
        document.querySelector(".image-info > img").src =
          typeof user.profile_image === "object" ? "./imgs/avatar.png" : user.profile_image;
        if (user.email === null) {
          document.querySelector(".info-email").innerHTML = "Not Found";
        } else {
          document.querySelector(".info-email").innerHTML = user.email;
        }
        document.querySelector(".info-name").innerHTML = user.name;
        document.querySelector(".info-username").innerHTML = user.username;
        document.querySelector(".posts-number").innerHTML = user.posts_count;
        document.querySelector(".comments-number").innerHTML = user.comments_count;
        document.querySelector(".posts-owner").innerHTML = user.name;
      })
      .catch((error) => console.log(error))
      .finally(() => loader(false));
    loader(true);
    axios
      .get(
        `https://tarmeezacademy.com/api/v1/users/${isMe && window.localStorage.getItem("user") ? post.id : post.author.id}/posts`,
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        let posts = response.data.data;
        for (let obj of posts) {
          let post = `
          <div class="post bg-light p-3 rounded shadow-sm mb-4" data-postid=${obj.id} data-userid=${obj.author.id}>
              <div class="
                  header d-flex align-items-center justify-content-between 
                  pb-2 mb-3 border-bottom border-secondary-emphasis
                ">
                <div class="activate-profile pointer-events-none" onclick="getTargetInfo('${encodeURIComponent(
                  JSON.stringify(obj)
                )}')">
                  <img class="user-img" src="${
                    typeof obj.author.profile_image === "object" ? "./imgs/avatar.png" : obj.author.profile_image
                  }" alt="user" onerror="src='./imgs/avatar.png'"/>
                  <span class="username fw-medium">${obj.author.username}</span>
                </div>
                <div class="post-controls"></div>
              </div>
              <div class="content">
                <div class="img-container text-center rounded">
                ${checkImage(obj)}
                </div>
                <span class="time mt-2 d-block text-secondary fw-semibold">${obj.created_at}</span>
                <div class="edit-area  mb-3 pb-1 border-bottom border-secondary-emphasis">
                <h4 class="post-title mt-2 mb-2">${obj.title === null ? "" : obj.title}</h4>
                <p class="post-body mt-2 fw-medium">${obj.body}</p>
              </div>
              <div class="post-footer d-flex align-items-center gap-1 flex-wrap">
                <i class="fa-solid fa-pen-clip"></i>
                <span>(${obj.comments_count})</span>
                <span>Comments</span>
                ${getPostTags(obj.tags)}
              </div>
          </div>
        `;
          if (window.localStorage.getItem("user")) {
            checkPostOwner(JSON.parse(window.localStorage.getItem("user")).id);
          }
          profilePosts.innerHTML += post;
        }
        showPost();
      })
      .catch((error) => console.log(error))
      .finally(() => loader(false));
  }
}

/* Check If It's Me As A Logged In User Delete Target Post If Found 
And Aplly My Login Data To showProfilePage Function To Show Them */
document.getElementById("profile").addEventListener("click", () => {
  window.localStorage.removeItem("profilePost");
});

// Function Handle The Loader Appearance Feature
function loader(flag) {
  if (flag) {
    document.querySelector(".loader").classList.remove("hide");
  } else {
    document.querySelector(".loader").classList.add("hide");
  }
}

// Function Handle Scroll To Top Feature
function goUp() {
  scrollTopBtn.onclick = function () {
    // Go To The Top Of App
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };
}

// Hansle Extra Features Soon
