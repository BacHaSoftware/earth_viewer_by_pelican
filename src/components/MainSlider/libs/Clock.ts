import EventEmitter from 'events';

export default class Clock extends EventEmitter {
  minTime: number;
  maxTime: number;
  time: number;
  direction: number;
  animationDuration: number;
  tickFreq: number;
  state: string;
  constructor() {
    super();
    this.minTime = 0.0;
    this.maxTime = 550.0;
    this.time = 0.0;
    this.direction = 1;

    // Duration in seconds.
    this.animationDuration = 30.0;

    // Refresh frequence in ms
    this.tickFreq = 100;

    this.state = 'paused';
  }

  setTime(time: number) {
    if (this.time != time) {
      this.time = time;
      if (this.time < this.minTime) this.time = this.minTime;
      if (this.time > this.maxTime) this.time = this.maxTime;
      this.emit('timeChanged', this);
    }
  }
}
