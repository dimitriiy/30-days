class AuthClass {
  setUser(user) {
    this.user = user;
  }
  getCurrentUser() {
    return this.user;
  }
}
const Auth = new AuthClass();

class APIClass {
  async getUsers() {
    try {
      const response = await fetch('users', { method: 'POST' });

      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getTasks() {
    try {
      const response = await fetch('tasks', { method: 'POST' });

      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async updateTask(data) {
    try {
      const response = await fetch('tasks', {
        body: JSON.stringify(data),
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      return await response.json();
    } catch (e) {
      console.error(e);
    }
  }
}
const Api = new APIClass();
