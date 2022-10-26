export default class Menu {
  name: string;
  title: string;
  icon: string;
  tags: string;
  menuitems: any[];

  constructor() {
    this.name = '';
    this.title = '';
    this.icon = '';
    this.tags = '';
    this.menuitems = [];
  }
}
