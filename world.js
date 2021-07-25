const fs = require("fs");

class World {
    constructor(data) {
        this.id_to_items = {};
        this.max_id = 0;
        data.forEach((value, i) => {
            this.id_to_items[value.id] = value;
            this.max_id = Math.max(this.max_id, value.id);
        })
    }

    add_item(data) {
        if (!data.id) {
            data.id = this.max_id + 1;
        }
        this.max_id = Math.max(this.max_id, data.id);
        this.id_to_items[data.id] = data;
        return data;
    }

    print(player, msg) {
        console.log(msg);
    }

    broadcast(item, msg) {
        console.log(`[${msg}]`);
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

    where(player) {
        if (!player.visited_ids) player.visited_ids = [];
        if (player.container_id) {
            const room = this.item(player.container_id);
            if (player.visited_ids.includes(room.id)) {
                this.print(player, `Sei in ${ room .name }`);
            } else {
                this.look_at(player, room);
            }
        } else {
            this.print(player, `Sei nel nulla! [${player.container_id}]`);
        }
    }

    look_at(player, item) {
        this.print(player, item.description || item.name);
        if (!item) {
            this.print(player, "c'è il nulla!");
            return;
        }
        if (item.closed) {
            if (item.locked) {
                this.print(player, "è chiuso a chiave");
            } else {
                this.print(player, "è chiuso");
            }
            return;
        }
        let objs = this.items_in(item).filter(obj => (obj.id != player.id));
        if (objs.length === 0) {
            if (item.attributes.includes("container"))  {
                if (item.attributes.includes("living")) {
                    this.print(player, "è a mani vuote");
                } else {
                    this.print(player, "...è vuoto");
                }
            } 
        } else if (objs.length === 1) {
            if (item.attributes.includes("living")) {
                this.print(player, "ha " + objs[0].name);
            } else {
                this.print(player, "c'è " + objs[0].name);
            }
        } else {
            if (item.attributes.includes("living")) {
                this.print(player, "ha");
            } else {
                this.print(player, "ci sono");
            }
            objs.forEach(obj => {
                this.print(player, "- " + obj.name);
            })
        }
    }
}

function loadWorld(filename) {
    const rawdata = fs.readFileSync(filename);
    const data = JSON.parse(rawdata);
    return new World(data);
}

exports.World = World;
exports.loadWorld = loadWorld;