import { API } from "./API.js";
import {
  renderPost,
  renderLoader,
  renderError,
  clearError,
  renderUserCheckbox,
} from "./renderer.js";

const api = new API();
const state = {
  page: 1,
  userIds: [],
  query: "",
  isLoading: false,
  endOfData: false,
};

const elements = {
  posts: document.getElementById("posts"),
  filters: document.getElementById("filters"),
  search: document.getElementById("search"),
  clear: document.getElementById("clear-filter"),
};

let observer;
let debounceTimer;

const debounce = (fn, delay = 600) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, delay);
};

async function initFilters() {
  try {
    const users = await api.fetchUsers();
    elements.filters.innerHTML = "";
    if (users && users.length) {
      users.forEach((user) => {
        const checkbox = renderUserCheckbox(user);
        checkbox.querySelector("input").addEventListener("change", () => {
          state.userIds = Array.from(
            elements.filters.querySelectorAll("input:checked")
          ).map((input) => Number(input.value));
          resetAndLoad();
        });
        elements.filters.appendChild(checkbox);
      });
    } else {
      elements.filters.innerHTML =
        '<p class="text-yellow-600 py-2">Нет пользователей</p>';
    }
  } catch (err) {
    renderError(err.message);
  }
}

async function loadPosts() {
  if (state.isLoading || state.endOfData) return;
  state.isLoading = true;
  renderLoader(true);
  clearError();

  try {
    const posts = await api.fetchPosts({
      title: state.query,
      userIds: state.userIds,
      page: state.page,
    });

    if (!Array.isArray(posts) || !posts.length) {
      state.endOfData = true;
      if (state.page === 1) {
        elements.posts.innerHTML =
          '<div class="bg-white p-6 rounded-lg shadow text-center"><p class="text-gray-500">Твитов не найдено</p></div>';
      }
      return;
    }

    for (const post of posts) {
      const user = await api.fetchUser(post.userId);
      elements.posts.appendChild(renderPost(post, user, state.query));
    }

    state.page++;
    observeLastPost();
  } catch (err) {
    renderError(err.message);
  } finally {
    state.isLoading = false;
    renderLoader(false);
  }
}

function observeLastPost() {
  if (observer) observer.disconnect();
  const lastPost = elements.posts.lastElementChild;
  if (!lastPost) return;

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadPosts();
  });
  observer.observe(lastPost);
}

function resetAndLoad() {
  state.page = 1;
  state.endOfData = false;
  elements.posts.innerHTML = "";
  loadPosts();
}

elements.search.addEventListener("input", (e) => {
  debounce(() => {
    state.query = e.target.value.trim();
    resetAndLoad();
  });
});

elements.clear.addEventListener("click", () => {
  state.userIds = [];
  state.query = "";
  elements.search.value = "";
  elements.filters
    .querySelectorAll("input[type=checkbox]")
    .forEach((input) => (input.checked = false));
  resetAndLoad();
});

document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  loadPosts();
});
