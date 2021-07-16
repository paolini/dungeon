import re
from collections import defaultdict

class Item(dict):
    def __init__(self, world, id, d):
        super().__init__(d)
        self.id = id
        self.world = world

    def __getitem__(self, key):
        try:
            return super().__getitem__(key)
        except KeyError:
            try:
                return self.world.items[super().__getitem__(key + '_id')]
            except KeyError:
                self[key] = None 
                return None

    def __getattr__(self, key):
        return self[key]

    def items(self):
        return [obj for obj in self.world.items.values() if obj.container == self]

class World:
    def __init__(self):
        self.MAX_ID = 0
        self.items = {}
    
    def add(self, item):
        self.MAX_ID += 1
        if not isinstance(item, Item):
            item = Item(self, self.MAX_ID, item)
        self.items[self.MAX_ID] = item
        return item

    def look_at(self, item):
        print(item.description or item.name)
        objs = item.items()
        if len(objs) == 0:
            if ("container" in item.attributes):
                print("...è vuoto")
        elif len(objs) == 1:
            print("c'è", objs[0].name)
        else:
            print("ci sono:")
            for obj in objs:
                print("-", obj.name)
        

class Command:
    def __init__(self, world, player):
        pass

class QuitCommand(Command):
    def matches(self, s):
        return s.lower() in ["basta", "fine", "quit", "abbandona", "bye"]
    
    def exec(self, player):
        return QUIT

class LookCommand(Command):
    r = re.compile("^(guarda|osserva|ispeziona) (.+)$")

    def matches(self, s):
        s = s.lower()
        self.target = None
        if s in ["guarda", "guarda in giro", "guardati in giro", 
            "guardati intorno", "guardati aggiro", "osserva", "ispeziona"]:
            return True
        m = self.r.match(s)
        if m:
            target = m[2]
            self.target = target
            return True
        return False
    
    def exec(self, player):
        if self.target is None:
            player.world.look_at(player.container)
        else:
            for obj in player.container.items():
                if obj.name.lower() == self.target:
                    player.world.look_at(obj)
                    return
            print("Non vedo nessun", self.target)
                
world = World()

cellar = world.add({
    'attributes': ["container", "room"],
    'name': "cantina",
    'description': "Sei in una cantina umida.",
})

sword = world.add({
    'attributes': ["weapon"],
    'name': "spada",
    'description': "è una spada bella",
    'container_id': cellar.id
})

chest = world.add({
    'attributes': ["container", "openable"],
    'locked': True,
    'name': "baule",
    'description':"è un vecchio baule di legno con rifiniture metalliche",
    'container_id':cellar.id})

rodolfo = world.add({
    'attributes': ["player", "living", "container"],
    'name': "Rodolfo",
    'description': "è un uomo sulla trentina con una lunga barba e dei baffoni viola, è vivo",
    'container_id': cellar.id, 
})

QUIT = False

Commands = [
    QuitCommand,
    LookCommand,
]

def play(player, world):
    print("Ciao, {}".format(player.name))
    while True:
        room = player.container
        if room:
            if player.last_container != room:
                print(room.description or room.name)
        player.last_container = room
            
        s = input("comando> ")
        s = s.strip()
        matches = [cmd for cmd in [Command(world,player) for Command in Commands] if cmd.matches(s)]
        if len(matches) == 1:
            r = matches[0].exec(player)
            if r is QUIT:
                print("Alla prossima!")
                break
        elif len(matches) == 0:
            print("Mi spiace, non ho capito...")
        else:
            print("Comando ambiguo...")
                    
if __name__ == "__main__":
    world = World()
    play(rodolfo, world)