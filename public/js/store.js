import { Api, Auth } from './api.js';

class Store {
  users = {};
  tasks = {};

  async loadUsers() {
    const users = await Api.getUsers();
    this.users = users.reduce(
      (acc, user) => ({
        ...acc,
        [user.id]: user,
      }),
      {}
    );
  }

  async loadTasks() {
    this.tasks = await Api.getTasks();
  }

  async updateTask({ day, isDone }) {
    const resp = await Api.updateTask({ id: Auth.getCurrentUser().id, day, isDone });

    return resp.result ? isDone : null;
  }

  async loadChallenge() {
    this.challengeManifest = await Api.getChallengeManifest();
  }

  async init() {
    return Promise.all([store.loadChallenge(), store.loadUsers(), store.loadTasks()]);
  }
}

export const store = new Store();
