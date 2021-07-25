const { IncomingMessage } = require("http");

class World {
    constructor(data) {
        this.id_to_items = {};
        data.forEach((value, i) => {
            value['id'] = i + 1,
            this.id_to_items[i+1] = value; 
        })
        this.print = console.log;
    }

    all_items() {
        let lst = [];
        Object.entries(this.id_to_items).forEach((pair) => {
            lst.push(pair[1]);
        })
        return lst;
    }

    item(item_id) {
        var found = null;
        this.all_items().forEach(item => {
            if (item.id == item_id) found=item;
        });
        return found;
    } 

    has_name(item, name) {
        if (!item.id) {
            item = world.item(item);
        }
        return item.name.toLowerCase() === name.toLowerCase();
    }

    item_by_name(name, items) {
        if (!items) items = this.all_items();
        items = items.filter(item => this.has_name(item, name));
        if (items.length > 0) {
            return items[0];
        }
        return null;
    }

    items_in(container) {
        const container_id = container.id || container;
        let lst = []
        this.all_items().forEach(item => {
            if (item["container_id"] === container_id) {
                lst.push(item);
            }
        })
        return lst;
    }

    visible_items_in(container) {
        let items = []
        this.items_in(container).forEach(item => {
            items.push(item);
            if (item.closed) return;
            items = items.concat(this.visible_items_in(item));
        });
        return items;
    }

    is_reachable_by(item, player) {
        if (!item.id) {
            item = this.item(item);
        }
        if (item.container_id === player.id || item.container_id === player.container_id) {
            return true;
        }
        if (!item.container_id) return false;
        const container = this.item(item.container_id);
        if (container.closed) return false;
        return this.is_reachable_by(container, player);
    }

    look_at(player, item) {
        const print = this.print;
        print(item.description || item.name);
        if (item.closed) {
            if (item.locked) {
                print("è chiuso a chiave");
            } else {
                print("è chiuso");
            }
            return;
        }
        let objs = this.items_in(item).filter(obj => (obj.id != player.id));
        if (objs.length === 0) {
            if (item.attributes.includes("container"))  {
                if (item.attributes.includes("living")) {
                    print("è a mani vuote");
                } else {
                    print("...è vuoto");
                }
            } 
        } else if (objs.length === 1) {
            if (item.attributes.includes("living")) {
                print("ha " + objs[0].name);
            } else {
                print("c'è " + objs[0].name);
            }
        } else {
            if (item.attributes.includes("living")) {
                print("ha");
            } else {
                print("ci sono");
            }
            objs.forEach(obj => {
                print("- " + obj.name);
            })
        }
    }
}

exports.World = World;