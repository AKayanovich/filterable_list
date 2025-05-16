export function renderPost(post, user, query = "") {
  if (
    !post ||
    !post.title ||
    !post.body ||
    !user ||
    !user.name ||
    !user.email
  ) {
    throw new Error(
      "Недостаточно данных для рендеринга поста или пользователя"
    );
  }

  const highlight = (text) =>
    query
      ? text.replace(
          new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
          '<span class="bg-yellow-100 font-semibold">$1</span>'
        )
      : text;

  const div = document.createElement("div");
  div.className = "bg-white p-4 rounded-lg shadow mb-6";
  div.innerHTML = `
    <div class="mb-3">
      <p class="font-bold text-gray-800">${user.name}</p>
      <p class="text-gray-500 text-sm">@${user.email.split("@")[0]}</p>
    </div>
    <h2 class="text-lg font-semibold text-gray-800 mb-2">${highlight(
      post.title
    )}</h2>
    <p class="text-gray-600">${highlight(post.body)}</p>
  `;
  return div;
}

export function renderLoader(visible) {
  const loader = document.getElementById("loader");
  if (!loader) {
    throw new Error("Элемент loader не найден");
  }
  loader.classList.toggle("hidden", !visible);
}

export function renderError(message) {
  const el = document.getElementById("error");
  if (!el) {
    throw new Error("Элемент error не найден");
  }
  el.textContent = message || "Произошла ошибка";
  el.classList.remove("hidden");
}

export function clearError() {
  const el = document.getElementById("error");
  el.classList.add("hidden");
}

export function renderUserCheckbox(user) {
  const label = document.createElement("label");
  label.className = "block p-2 rounded-lg hover:bg-gray-100 cursor-pointer";
  label.innerHTML = `
    <input type="checkbox" name="userFilter" value="${user.id}" class="mr-2" />
    <span class="text-sm truncate">${user.email}</span>
  `;
  return label;
}
