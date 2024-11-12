class AuthClass {
  setUser(user) {
    this.user = user;
  }
  getCurrentUser() {
    return this.user;
  }
}

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

  async getChallengeManifest() {
    try {
      const response = await fetch('challenge', { method: 'POST' });

      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
export const Api = new APIClass();
export const Auth = new AuthClass();
