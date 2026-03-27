export const audioApi = {
  clock: new Audio("/quize/assets/clock.mp3"),
  timeIsUp: new Audio("/quize/assets/timer-is-up.mp3"),

  playTick: () => {
    audioApi.clock.play();
  },

  stopTick: () => {
    audioApi.clock.pause();
    audioApi.clock.currentTime = 0;
  },

  playTimeIsUp: () => {
    audioApi.timeIsUp.play();
  },

  stopTimeIsUp: () => {
    audioApi.timeIsUp.pause();
    audioApi.timeIsUp.currentTime = 0;
  },
};
