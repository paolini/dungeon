const { abort, exit } = require("process");

data = require("./data")
World = require("./world").World
commands = require("./commands").commands

function play(player, world, input) {
    const print = world.print;
    const room = world.item(player.container_id);
    player.last_container_id = room.id;
    if (input) {
        input.toLowerCase();
        let matches = commands.map(cmd => cmd(input)).filter(cmd => (cmd != null));
        if (matches.length === 1) {
            command = matches[0];
            if (command(player, world)) {
                exit(0);
            }
        } else if (matches.length == 0) {
            print("Mi spiace, non ho capito...")
        } else {
            print("Comando ambiguo...")
        }
    }
    if (player.container_id && (player.container_id != room.id || input === null)) {
        const new_room = world.item(player.container_id);
        if (player.visited_ids.includes(new_room.id)) {
            print(new_room.name)
        } else {
            world.look_at(player, new_room, print);
            player.visited_ids.push(new_room.id);
        }
    }
}

function main(player, world) {
    world.print(`Ciao ${player.name}`);
    if (!player.visited_ids) {
        player.visited_ids = [];
    }
    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    play(player, world, null);
    const prompt = "COSA DEVO FARE?"
    world.print(prompt);
    rl.on('line', function(line){
        // console.log("> " + line);
        play(player, world, line);
        world.print(prompt);
    });
}

var world = new World(data.data)
var rodolfo = null;

world.all_items().forEach(item => {
    if (item.name === 'Rodolfo') rodolfo = item;
})

main(rodolfo, world);

// console.log(world.items_in(rodolfo))

