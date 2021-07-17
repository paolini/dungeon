from collections import defaultdict

from commands import Command, Commands

def play(player, world):
    print("Ciao, {}".format(player.name))
    if player.visited_ids is None:
        player['visited_ids'] = []
    while True:
        # print("player", player)
        room = player.container
        if room:
            if player.last_container != room:
                if room.id in player.visited_ids:
                    print(room.name)
                else:
                    print(room.description)
                    player['visited_ids'].append(room.id)
        player.last_container = room
            
        s = input("comando> ")
        s = s.strip()
        matches = [cmd for cmd in [Command(world,player) for Command in Commands] if cmd.matches(s)]
        if len(matches) == 1:
            r = matches[0].exec(player)
            if r is Command.QUIT:
                print("Alla prossima!")
                break
        elif len(matches) == 0:
            print("Mi spiace, non ho capito...")
        else:
            print("Comando ambiguo...")

if __name__ == "__main__":
    from data import rodolfo, world
    play(rodolfo, world)
