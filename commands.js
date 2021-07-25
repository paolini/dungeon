
function quit(input) {
    input.toLowerCase();
    input.trim();
    if (["basta", "fine", "quit", "abbandona", "bye", "esci", "x"].includes(input)) {
        return (player, world) => {
            if (input.length > 1) world.print(player, "Basta che scrivi 'x' per uscire");
            world.print(player, "Alla prossima!");
            world.broadcast(player, `${player.name} se n'è andato`);
            return true;
        };
    }
    return null;
}

function debug(input) {
    const re = /^debug (.+)$/;
    let m = re.exec(input);
    if (m) {
        let target_name = m[1];
        return (player, world) => {
            let target = null;
            let target_id = parseInt(target_name);
            if (target_id >= 0) {
                target = world.item(target_id);            
            } else {
                target = world.item_by_name(target_name);
            }
            if (target) {
                world.print(player, `${target.name}=${JSON.stringify(target)}`);
            } else {
                world.print(player, `${target_name}: nessun oggetto con questo nome`);
            }
        }
    }
    return null;
}

function look(input) {
    if (["guarda", "guarda in giro", "guardati in giro",
        "guardati intorno", "guardati aggiro", "osserva", "ispeziona"].includes(input)) {
        return (player, world) => {
            world.look_at(player, world.item(player.container_id));
        };
    }
    const re = /^(guarda|osserva|ispeziona) (.+)$/;
    let m = re.exec(input);
    if (m) {
        let target_name = m[2];
        return (player, world) => {
            let items = world.items_in(player.container_id).concat(world.items_in(player));
            const target = world.item_by_name(target_name, items);
            if (target) world.look_at(player, target);
            else world.print(player, `Non vedo nessun ${target_name}`);
        }
    }
}

function go(input) {

    function direction(s) {
        const match = Object.entries({
            'n': ['nord'],
            's': ['sud'],
            'e': ['est'],
            'w': ['o','ovest'],
            'u': ['a','alto',"l'alto",'su','sù'],
            'd': ['b','basso',"il basso",'giu','giù'],
        }).filter(pair => (pair[0] == s || pair[1].includes(s)));
        if (match.length > 0) return match[0][0];
        return null;
    }

    function move(player, world, direction) {
        const old_room = world.item(player.container_id);
        const passages = old_room.passages;
        if (passages) {
            const room_id = passages[direction];
            if (room_id) {
                const room = world.item(room_id);
                player.container_id = room.id;
                world.where(player);
                world.broadcast(player, `${player.name} è andato da ${old_room.name} a ${room.name}`)
            } else {
                world.print(player, `impossibile muoversi in questa direzione`);
            }
        } else {
            world.print(player, `non c'è nessun passaggio`);
        }
    }

    let dir = direction(input);
    if (dir === null) {
        const r = /^(vai a|vai verso|vai) (.*)$/;
        const m = r.exec(input);
        if (m) {
            dir = direction(m[2]);
            if (dir) {
                return (player, world) => {
                    world.print(player, `Basta che dici: ${m[2]}`);
                    if (m[2].length > 1) world.print(player, `...o anche solo: ${dir}`);
                    move(player, world, dir);
                }
            } else {
                return (player, world) => {
                    world.print(player, `${m[2]} non è una direzione valida. Prova: n,nord,s,sud,e,est,w,ovest,u,alto,d,basso`);
                }
            }
        }
    } else {
        return (player, world) => {move(player, world, dir);}
    }
}

function take(input) {
    const r = /^(prendi|raccogli|afferra) (.+)$/;
    const m = r.exec(input);
    if (m) {
        const target_name = m[2];
        return (player, world) => {
            const item = world.item_by_name(target_name,
                world.visible_items_in(player.container_id).concat(
                world.visible_items_in(player)));
            if (!item) {
                world.print(player, `non vedo nessun ${target_name}`);
                return;
            }
            if (!(item.attributes && item.attributes.includes("collectable"))) {
                world.print(player, `non puoi sollevare ${item.name}`);
            } else if (!world.is_reachable_by(item, player)) {
                world.print(player, `non puoi raggiungere ${item.name}`);
            } else {
                item.container_id = player.id;
                world.print(player, `ho preso ${item.name}`);
                world.broadcast(player, `${player.name} ha preso ${item.name}`);
            }
        }
    }
}

function put(input) {
    function check_have(target_name, player, world) {
        const item = world.item_by_name(target_name, world.items_in(player));
        if (!item) {
            world.print(player, `non hai ${target_name}`);
            return null;
        } else if (item.attributes.includes("collectable")) {
            return item;
        } else {
            world.print(player, `non puoi sollevare ${target_name}`);
            return null;
        }
    }

    const r2 = /^(metti|lascia|inserisci) (.+) (dentro|in|nel|nello|nella|nell\'|sull\'|sul|nella|sullo|sotto|sopra) (.+)$/;
    const m2 = r2.exec(input);

    if (m2) {
        const target_name = m2[2];
        const box_name = m2[4];
        return (player, world) => {
            const item = check_have(target_name, player, world);
            const box = world.item_by_name(box_name, 
                world.visible_items_in(player).concat(
                world.visible_items_in(player.container_id)));
            if (item) {
                if (!box) {
                    world.print(player, `non vedo ${box_name}`);
                } else if (!world.is_reachable_by(box, player)) {
                    world.print(player, `${box.name} irraggiungibile`);
                } else if (!box.attributes.includes("container")) {
                    world.print(player, `non puoi mettere ${item.name} dentro ${box.name}`);
                } else if (box.closed) {
                    world.print(player, `${box.name} è chiuso`);
                } else if (box.id === item.id) {
                    world.print(player, `Stai provando a rompere lo spaziotempo. Sciocco hobbit!`);
                } else {
                    item.container_id = player.container_id;
                    world.print(player, `hai messo ${item.name} dentro ${box.name}`);
                    world.broadcast(player, `${player.name} ha messo ${item.name} in ${box.name}`);
                }
            }
        }
    }
    const r = /^(lascia|molla) (.+)$/;
    const m = r.exec(input);
    if (m) {
        const item_name = m[2];
        return (player, world) => {
            const item = world.item_by_name(item_name, world.items_in(player));
            if (item) {
                item.container_id = player.container_id;
                world.print(player, `hai lasciato ${item.name}`);
                world.broadcast(player, `${player.name} ha lasciato ${item.name}`);
            } else {
                world.print(player, `non hai ${item_name}`);
            }
        }
    }
}

function say(input) {
    const r = /^(di|dì|pronuncia|urla|sussurra|bisbiglia)(:| ) *["\']?(.+?)["\']?$/;
    const m = r.exec(input);
    if (m) {
        const phrase = m[3];
        return (player, world) => {
            world.print(player, `${player.name}: ${phrase}`);
            world.broadcast(player, `${player.name}: ${phrase}`);
        }
    }
}

function open(input) {
    const r = /^(apri|sblocca) (.+)$/;
    const m = r.exec(input);
    if (m) {
        const item_name = m[2];
        return (player, world) => {
            const item = world.item_by_name(item_name,
                world.visible_items_in(player.container_id).concat(
                    world.visible_items_in(player)));
            function done(item) {
                world.broadcast(player, `${player.name} ha aperto ${item.name}`);
                const items = world.items_in(item);
                if (items.length>0) {
                    world.print(player, `contiene:`);
                    items.forEach(obj => {
                        world.print(player, `- ${obj.name}`);
                    });
                } else {
                    world.print(player, `è vuoto!`);
                }
            }
            if (!item) {
                world.print(player, `non vedo nessun ${item_name}`);
            } else if (!world.is_reachable_by(item, player)) {
                world.print(player, `non riesco a raggiungere ${item.name}`);
            } else if (!item.attributes.includes("openable")) {
                world.print(player, `non puoi aprire ${item.name}`);
            } else if (!item.closed) {
                world.print(player, `sciocco hobbit, ${item.name} è già aperto`);
            } else if (item.locked) {
                const keys = world.items_in(player).filter(obj => (obj.opens_id === item.id));
                if (keys.length>0) {
                    item.locked = false;
                    item.closed = false;
                    world.print(player, `hai aperto ${item.name} con ${keys[0].name}`);
                    done(item);
                } else {
                    world.print(player, `non hai la chiave per aprire ${item.name}`);
                }
            } else {
                item.closed = false;
                world.print(player, `hai aperto ${item.name}`);
                done(item);
            }
        }
    }
}

function enter(input) {
    const r = /^(entra) (in|nel|nell\'|nello|nella|dentro) (.+)/;
    const m = r.exec(input);
    if (m) {
        const obj_name = m[3];
        return (player, world) => {
            const obj = world.item_by_name(obj_name, 
                world.visible_items_in(player.container_id).concat(
                    world.visible_items_in(player)));
            if (!obj) {
                world.print(player, `non vedo ${obj_name}`);
            } else if (!world.is_reachable_by(obj, player)) {
                world.print(player, `non arrivi a ${obj.name}`);
            } else if (obj.container_id === player.id) {
                world.print(player, `per problemi di manutenzione non puoi entrare in un'oggetto che hai in mano, perfavore lasciare l'oggetto in cui si desidera entrare`);
            } else if (!obj.attributes.includes("container")) {
                world.print(player, `non puoi entrare dentro ${obj.name}`);
            } else if (obj.closed) {
                world.print(player, `${obj.name} è chiuso`);
            } else {
                player.container_id = obj.id;
                world.where(player);
                world.broadcast(player, `${player.name} è entrato in ${obj.name}`);
            }
        }
    }
}

function exit(input) {
    const r = /^(esci|emergi) (da|dal|dalla|dallo) (.+)$/;
    const m = r.exec(input);
    if (m) {
        const container_name = m[3];
        return (player, world) => {
            const container = world.item(player.container_id);
            if (!world.has_name(container, container_name)) {
                world.print(player, `non sei dentro ${container_name}`);
            } else if (container.container_id) {
                if (container.closed) {
                    world.print(player, `${container.name} è chiuso`);
                } else {
                    player.container_id = container.container_id;
                    world.print(player, `sei uscito da ${container.name}`);
                    world.where(player);
                    world.broadcast(player, `${player.name} è uscito da ${container.name}`);
                }
            } else if (container.passages) {
                world.print(player, `devi dire una direzione per uscire`);
            } else {
                world.print(player, `apparentemente sei in un luogo senza uscite!`);
            }
        }
    }
}

exports.commands = [quit, debug, look, go, take, put, say, open, enter, exit];