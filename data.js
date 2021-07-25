const True = true
const False = false
exports.data = [
    {'attributes': ['room'], 'name': 'cantina', 'description': 'Sei in una cantina umida. A nord una rampa di scale porta verso la luce.', 'id': 1, 'passages': {'u': 2, 'n': 2}}, 
    {'attributes': ['room'], 'name': 'cucina', 'description': "Sei in una bella cucina pulita. Sul lato sud le scale portano verso l'oscurità. Sul lato est è presente una porticina", 'id': 2, 'passages': {'d': 1, 's': 1, 'e': 3}}, 
    {'attributes': ['room'], 'name': 'sala da pranzo', 'description': "un'enorme tavolata apparecchiata circondata da sedie e sgabelli riempe la lunga sala, trofei di caccia ne adornano i muri", 'id': 3, 'passages': {'w': 2}}, 
    {'attributes': ['weapon', 'collectable'], 'name': 'spada', 'description': 'è la spada si lord Drhoghenart il distruttore di ghiacciai, è una spada bella', 'container_id': 1, 'id': 4}, 
    {'attributes': ['container', 'openable'], 'closed': True, 'locked': True, 'name': 'baule', 'description': 'è un vecchio baule di legno con rifiniture metalliche', 'open_msg': 'un ratto ti soffia contro arrabbiato da dentro il baule', 'container_id': 1, 'id': 5}, 
    {'attributes': ['collectable', 'openable', 'container'], 'closed': True, 'name': 'barattolo', 'description': 'è pieno di zucchero', 'container_id': 2, 'id': 6}, 
    {'attributes': ['collectable'], 'opens_id': 5, 'name': 'chiave', 'description': 'una vecchia chiave arrugginita... sa di zucchero', 'container_id': 6, 'id': 7}, 
    {'attributes': ['collectable', 'container'], 'name': 'zaino', 'description': 'lo zaino da scampagnate di Rodolfo', 'container_id': 5, 'id': 8}, 
    {'attributes': ['collectable', 'shield'], 'name': 'scudo', 'description': "uno scudo di legno piccolo e rovinato, c'è attaccato un bigliettino con scritto:42 ", 'container_id': 5, 'id': 9}, 
    {'attributes': ['living', 'collectable'], 'name': 'ratto', 'description': 'è molto arrabbiato con Rodolfo per averlo disturbato', 'container_id': 5, 'id': 10}, 
    {'attributes': ['player', 'living', 'container'], 'name': 'Rodolfo', 'description': 'è un uomo sulla trentina con una lunga barba e dei baffoni viola, è vivo', 'container_id': 1, 'id': 11}
]
