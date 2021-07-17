from world import World

world = World()

cellar = world.add({
    'attributes': ["room"],
    'name': "cantina",
    'description': "Sei in una cantina umida. A nord una rampa di scale porta verso la luce.",
})

kitchen = world.add({
    'attributes': ["room"],
    'name': "cucina",
    'description': "Sei in una bella cucina pulita. Sul lato sud le scale portano verso l'oscurità.",
})

cellar.set_passage(kitchen, 'u')
cellar.set_passage(kitchen, 'n')

sword = world.add({
    'attributes': ["weapon", "collectable"],
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
