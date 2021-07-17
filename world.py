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

    def set_passage(self, room, dir, rev_dir=None):
        if rev_dir is None:
            rev_dir = {'n':'s', 's':'n', 'e':'w', 'w':'e', 'u':'d', 'd':'u'}[dir]
        if self.passages is None:
            self['passages'] = {}
        self.passages[dir] = room.id
        if rev_dir is not False:
            room.set_passage(self, rev_dir, False)

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
