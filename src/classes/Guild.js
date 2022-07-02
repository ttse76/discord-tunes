class Guild {
  constructor(id) {
    this.id = id;
    this.queue = [];
  }

  get guildId() {
    return this.id;
  }

  get numInQueue() {
    return this.queue.length;
  }

  add(song) {
    this.queue.push(song);
  }

  getNext() {
    return this.queue.shift();
  }
}

exports.Guild = Guild;