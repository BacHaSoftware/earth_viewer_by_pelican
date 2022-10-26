import EventEmitter from 'events';
import { hasTag } from '../../../helpers/hasTag';

export default class TagFilter extends EventEmitter {
  tags: string[];

  constructor() {
    super();
    this.tags = ['city', 'grid'];
  }

  addTag(tag: string) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.emit('filterChanged');
    }
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter((el) => el !== tag);
    this.emit('filterChanged');
  }
  filter(objects: any[]) {
    let results = [];
    for (let i = 0; i < objects.length; i++) {
      let o = objects[i];
      if (this.passes(o)) {
        results.push(o);
      }
    }
    console.log('result', results);
    return results;
  }

  passes(o: any) {
    for (let i = 0; i < this.tags.length; i++) {
      if (hasTag(o, this.tags[i])) {
        return true;
      }
    }
    return false;
  }
}
