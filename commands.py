import re

class Command:
    QUIT = False
    def __init__(self, world, player):
        pass

class QuitCommand(Command):
    def matches(self, s):
        if s.lower() in ["basta", "fine", "quit", "abbandona", "bye", "esci", "x"]:
            if len(s)>1:
                print("Basta che scrivi 'x' per uscire")
            return True
        return False
    
    def exec(self, player):
        return self.QUIT

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
            player.world.look_at(player, player.container)
        else:
            for obj in player.container.items():
                if obj.name.lower() == self.target:
                    player.world.look_at(player, obj)
                    return
            print("Non vedo nessun", self.target)

class GoCommand(Command):
    r = re.compile(r'^(vai a|vai verso|vai) (.*)$')

    def direction(self, s):
        d = {
            'n': ['nord'],
            's': ['sud'],
            'e': ['est'],
            'w': ['o','ovest'],
            'u': ['a','alto',"l'alto",'su','sù'],
            'd': ['b','basso',"il basso",'giu','giù'],
        }
        for key, vals in d.items():
            if s==key or s in vals:
                return key
        return None

    def matches(self, s):
        s = s.lower()
        self.dir = self.direction(s)
        if self.dir is not None:
            return True
        m = self.r.match(s)
        if m:
            self.dir = self.direction(m[2])
            if self.dir is not None:
                print("Basta che dici:",m[2])
                if len(m[2]) > 1:
                    print("...oppure anche solo:", self.dir)
            else:
                print(m[2] + " non è una direzione valida. Prova: n,nord,s,sud,e,est,w,ovest,u,alto,d,basso")
            return True
        return False

    def exec(self, player):
        if self.dir is None:
            return
        if not player.container.passages:
            print("non c'è nessun passaggio")
            return
        try:
            room_id = player.container.passages[self.dir]
            player['container_id'] = room_id
        except KeyError:
            print("impossibile muoversi in questa direzione")
            return

class TakeCommand(Command):
    r = re.compile(r'^(prendi|raccogli|afferra) (.*)$')
    def matches(self, s):
        m = self.r.match(s)
        self.target = None
        if m:
            self.target = m[2]
            return True
        return False
    
    def exec(self, player):
        for obj in player.container.items():
            if obj.name.lower() == self.target:
                if obj.be("collectable"):
                    obj.container_id = player.id
                    print("fatto!")
                else:
                    print("non puoi sollevare", self.target)                     
                return
        print("Non vedo nessun", self.target)

Commands = [
    QuitCommand,
    LookCommand,
    GoCommand,
    TakeCommand,
]

