import re

class Command:
    def __init__(self, world, player):
        pass

class DebugCommand(Command):
    r = re.compile("^/debug (.+)$")

    def matches(self, s):
        m = self.r.match(s)
        if m:
            self.target = m[1]
            return True 
        else:
            return False

    def exec(self, player):
        count = 0
        try:
            self.target = int(self.target)
        except ValueError:
            pass
        for obj in player.world.items():
            if obj.name.lower() == self.target or obj.id == self.target:
                print("{}[id={}]: {}".format(obj.name, obj.id, obj))
                count += 1
        if count == 0:
            print(self.target + ": nessun oggetto con questo nome")

class QuitCommand(Command):
    def matches(self, s):
        if s.lower() in ["basta", "fine", "quit", "abbandona", "bye", "esci", "x"]:
            if len(s)>1:
                print("Basta che scrivi 'x' per uscire")
            return True
        return False
    
    def exec(self, player):
        print("Alla prossima!")

class LookCommand(Command):
    r = re.compile("^(guarda|osserva|ispeziona) (.+)$")

    def matches(self, s):
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
            for obj in player.container.items() + player.items():
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
    r = re.compile(r'^(prendi|raccogli|afferra) (.+)$')

    def matches(self, s):
        m = self.r.match(s)
        if m:
            self.target = m[2]
            return True
        return False
    
    def exec(self, player):
        for obj in player.container.visible_items() + player.visible_items():
            if obj == player:
                continue
            if obj.name.lower() == self.target:
                if not obj.be("collectable"):
                    print("non puoi sollevare", obj.name)
                elif not obj.is_reachable_by(player):
                    print("non puoi raggiungere", obj.name)
                else:
                    obj["container_id"] = player.id
                    print("Ho preso", obj.name)
                return
        print("Non vedo nessun", self.target)

class DropCommand(Command):
    r = re.compile(r'^(lascia|molla) (.+)$')
    r2 = re.compile(r'^(metti|lascia|inserisci) (.+) (dentro|in|nel|nello|nella|nell\'|sull\'|sul|nella|sullo|sotto|sopra) (.+)$')

    def matches(self, s):
        m = self.r2.match(s)
        if m:
            self.target = m[2]
            self.box = m[4]
            return True
        m = self.r.match(s)
        if m:
            self.target = m[2]
            self.box = None
            return True
        return False
    
    def exec(self, player):
        for obj in player.items():
            if obj.name.lower() == self.target:
                assert obj.be("collectable")
                break
        else:
            print("Non hai", self.target)
            return
        if self.box:
            for box in player.visible_items() + player.container.visible_items():
                if box.name.lower() == self.box:
                    if not box.is_reachable_by(player):
                        print(box.name, "irraggiungibile")
                        return
                    if not box.be("container"):
                        print ("non puoi mettere", obj.name, "dentro", box.name)
                        return
                    if box.closed:
                        print(box.name, "è chiuso")
                        return    
                    if box == obj:
                        print("stai provando a rompere lo spaziotempo,non va bene,sciocco hobbit")
                        return
                    break
            else:
                print("non vedo", self.box)
                return
            obj["container_id"] = box.id
            print("hai messo", obj.name, "dentro", box.name)     
        else:
            obj["container_id"] = player.container.id
            print("hai lasciato", obj.name)                     

class SayCommand(Command):
    r = re.compile(r'^(di|dì|pronuncia|urla|sussurra|bisbiglia)(:| ) *["\']?(.+?)["\']?$')

    def matches(self, s):
        m=self.r.match(s)
        if m:
            self.phrase=m[3]
            return True
        return False

    def exec(self, player):
        print(player.name+ ":", self.phrase)

class OpenCommand(Command):
    r = re.compile(r'^(apri|sblocca) (.+)$')

    def matches(self, s):
        m = self.r.match(s)
        if m:
            self.target = m[2]
            return True
        return False
    
    def exec(self, player):
        for obj in player.container.visible_items() + player.visible_items():
            if obj.name.lower() == self.target:
                if not obj.is_reachable_by(player):
                    print("non riesco a raggiungere", obj.name)
                    return
                if not obj.be("openable"):
                    print("non puoi aprire", obj.name)
                    return
                if not obj.closed:
                    print("sciocco hobbit", obj.name, "è già aperto")
                    return
                if obj.locked:
                    for o in player.items():
                        if obj == o.opens :
                            obj["locked"] = False
                            obj["closed"] = False
                            print("hai aperto", obj.name, "con", o.name)
                            break
                    else:
                        print("non hai la chiave per aprire", obj.name)
                        return
                else:
                    obj["closed"] = False
                    print("hai aperto", obj.name)
                lst = obj.items()
                if lst:
                    print("contiene:")
                    for x in lst:
                        print("-", x.name)
                else:
                    print("è vuoto")
                return
        print("Non vedo nessun", self.target)

class EnterCommand(Command):
    r = re.compile(r'^(entra) (in|nel|nell\'|nello|nella|dentro) (.+)$')

    def matches(self, s):
        m = self.r.match(s)
        if m:
            self.target = m[3]
            return True
        return False
    
    def exec(self, player):
        for obj in player.container.visible_items() + player.visible_items():
            if obj.name.lower() == self.target:
                if not obj.is_reachable_by(player):
                    print("non arrivi a", obj.name)
                    return
                if obj.container == player:
                    print("per problemi di manutenzione non puoi entrare in un'oggetto che hai in mano, perfavore lasciare l'oggetto in cui si desidera entrare")
                    return
                if not obj.be("container"):
                    print("non puoi entrare dentro", obj.name)
                    return
                if obj.closed:
                    print(obj.name, "è chiuso")
                    return
                else:
                    player["container_id"] = obj.id
                    print("sei entrato dentro", obj.name)
                    return
        else:
            print("non vedo", self.target)

class ExitCommand(Command):
    r = re.compile(r'^(esci|emergi) (da|dal|dalla|dallo) (.+)$')

    def matches(self, s):
        m = self.r.match(s)
        if m:
            self.target = m[3]
            return True
        return False
    
    def exec(self, player):
        if self.target != player.container.name.lower():
            print("non sei dentro", self.target)
            return
        if player.container.container:
            if player.container.closed:
                print(player.container.name, "è chiuso")
                return
            print("sei uscito da", player.container.name)
            player["container_id"] = player.container["container_id"]
        else:
            if player.container.passages:
                print("devi dire una direzione per uscire")
            else:
                print("non puoi uscire :( !")     

        
Commands = [
    DebugCommand,
    QuitCommand,
    LookCommand,
    GoCommand,
    TakeCommand,
    DropCommand,
    SayCommand,
    OpenCommand,
    EnterCommand,
    ExitCommand,
]

