export class API {
  #userCache = new Map();

  async #checkResponse(res, action) {
    if (!res.ok) {
      throw new Error(
        `Не удалось ${action}: Сервер вернул ${res.status} ${res.statusText}`
      );
    }
    const data = await res.json();
    if (data === null || data === undefined) {
      throw new Error(`Не удалось ${action}: Ответ сервера пуст`);
    }
    return data;
  }

  async fetchUsers() {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await this.#checkResponse(res, "загрузить пользователей");
    if (!Array.isArray(data)) {
      throw new Error("Не удалось загрузить пользователей");
    }
    data.forEach((user) => this.#userCache.set(user.id, user));
    return data;
  }

  async fetchUser(id) {
    if (this.#userCache.has(id)) return this.#userCache.get(id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Не удалось загрузить пользователя: Неверный ID");
    }
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    const data = await this.#checkResponse(res, "загрузить пользователя");
    if (typeof data !== "object" || !data.id || !data.name || !data.email) {
      throw new Error("Не удалось загрузить пользователя");
    }
    this.#userCache.set(id, data);
    return data;
  }

  async fetchPosts({ title = "", userIds = [], page = 1 }) {
    if (page < 1) {
      throw new Error("Не удалось загрузить твиты");
    }
    let query = `_page=${page}&_limit=10`;
    if (title) {
      query += `&title_like=${encodeURIComponent(title)}`;
    }
    if (userIds.length > 0) {
      query += userIds.map((id) => `&userId=${id}`).join("");
    }
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/posts?${query}`
    );
    const data = await this.#checkResponse(res, "загрузить твиты");
    if (!Array.isArray(data)) {
      throw new Error("Не удалось загрузить твиты");
    }
    return data;
  }
}
