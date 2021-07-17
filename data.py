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
    'description': "è la spada si lord Drhoghenart il distruttore di ghiacciai, è una spada bella",
    'container_id': cellar.id
})

chest = world.add({
    'attributes': ["container", "openable"],
    'closed': True,
    'locked': True,
    'name': "baule",
    'description':"è un vecchio baule di legno con rifiniture metalliche",
    'open_msg': "un ratto ti soffia contro arrabbiato da dentro il baule",
    'container_id':cellar.id})

sugar_jar = world.add({
    'attributes': ["collectable", "openable"],
    'closed': True,
    'name': "barattolo",
    'description': "è pieno di zucchero",
    'container_id':kitchen.id,
    })

chest_key = world.add({
    'attributes': ["collectable"],
    'opens_id': chest.id,
    'name': "chiave",
    'description': "una vecchia chiave arrugginita... sa di zucchero",
    'container_id':sugar_jar.id,
})

backpack = world.add({
    'attributes': ["collectable", "container"],
    'name': "zaino",
    'description': "lo zaino da scampagnate di Rodolfo",
    'container_id':chest.id,
})
shield = world.add({
    'attributes': ["collectable", "shield"],
    'name': "scudo",
    'description': "uno scudo di legno piccolo e rovinato, c'è attaccato un bigliettino con scritto:42 ",
    'container_id':chest.id,
})
rat = world.add({
'attributes': ["living","collectable"],
'name': "ratto",
'description': "è molto arrabbiato con Rodolfo per averlo disturbato",
'container_id':chest.id,
})

rodolfo = world.add({
    'attributes': ["player", "living", "container"],
    'name': "Rodolfo",
    'description': "è un uomo sulla trentina con una lunga barba e dei baffoni viola, è vivo",
    'container_id': cellar.id, 
})
