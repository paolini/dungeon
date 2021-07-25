const { abort, exit } = require("process");

const { loadWorld } = require("./world");
commands = require("./commands").commands;

function play(player, world, input) {
    if (!player.container_id) {
        if (player.spawn_id) {
            player.container_id = player.spawn_id;
        } else {
            const rooms = world.all_items().filter(item => item.attributes.includes("spawn"));
            if (rooms.length === 0) {
                world.print(player, "non ho trovato nessuna stanza dove metterti...");
            } else {
                player.container_id = rooms[0].id;
            }
        }
    }
    if (input) {
        input.toLowerCase();
        let matches = commands.map(cmd => cmd(input)).filter(cmd => (cmd != null));
        if (matches.length === 1) {
            command = matches[0];
            if (command(player, world)) {
                exit(0);
            }
        } else if (matches.length == 0) {
            world.print(player, "Mi spiace, non ho capito...")
        } else {
            world.print(player, "Comando ambiguo...")
        }
    }
}

function main(player, world) {
    world.print(player, "Ciao!");

    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    play(player, world, null);
    world.where(player);
    const prompt = "COSA DEVO FARE?"
    console.log(prompt);
    rl.on('line', function(line){
        // console.log("> " + line);
        play(player, world, line);
        console.log(prompt);
    });
}

var world = loadWorld("data.json")

world.all_items().forEach(item => {
    if (item.name === 'Rodolfo') rodolfo = item;
})

if (require.main === module) {
    const players = world.all_items().filter(item => item.attributes.includes("player"));
    if (players.length == 0) {
        console.log("No players in world!");
    } else {
        const player = players[0];
        main(player, world);
    }
}

exports.play = play;
exports.world = world;
exports.player = rodolfo;

