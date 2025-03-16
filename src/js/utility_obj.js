const resourceRarity = {
    gems_purple: 0.1, gold: 0.1,  // Très rare 
    gems_green: 0.2, gems_blue: 0.2, silver: 0.2,
    iron: 0.4, copper: 0.4, coal: 0.4,
    sugar_cane: 0.4, vine: 0.4, tobacco: 0.4, coffee: 0.4, cacao: 0.4, 
    cotton: 0.5, orchards: 0.5, wool: 0.5, meat: 0.5,
    banana: 0.8, cereals: 0.9, stone: 0.9, wood: 0.9,
    fish: 1, // Très commun 
};
const basePrices =  {
    gems_purple: 120, gems_green: 90, gems_blue: 70, gold: 100, silver: 40, iron: 25, copper: 25, coal: 20,
    stone: 10, wood: 10, lumber: 20, cotton: 15, wool: 15,
    sugar_cane: 20, vine: 20, tobacco: 20, coffee: 20, cacao: 20,
    banana: 15, orchards: 10, meat: 15, cereals: 15, fish: 5, food: 20,
    tools: 15, fabric: 25, weapon: 100, clothes: 30, liquor: 30, cigars: 40, chocolate: 35, ground_coffee: 30, jewelry: 75,
    spear: 100, shield: 150, rifle: 150, artillery: 250,
};
const constructionPriorities = {
    high: [
        { type: "farm", cost: { wood: 10, stone: 5 }, constructionTime: 60, minPopulation: 2 },
        { type: "livestock_ranches", cost: { wood: 10, stone: 5 }, constructionTime: 60, minPopulation: 2 },
        { type: "quarry", cost: { wood: 10, stone: 5 }, constructionTime: 60, minPopulation: 2 },
        { type: "lumberjack_hut", cost: { wood: 5, stone: 10 }, constructionTime: 60, minPopulation: 2 },
        { type: "fishing_hut", cost: { wood: 10, stone: 5 }, constructionTime: 60, minPopulation: 2 },
        { type: "mine", cost: { wood: 20, stone: 10 }, constructionTime: 60, minPopulation: 5 },
        { type: "market", cost: { wood: 15, stone: 15 }, constructionTime: 60, minPopulation: 7 },
        { type: "port", cost: { wood: 25, stone: 10 }, constructionTime: 120, minPopulation: 7 },
        { type: "forge", cost: { wood: 20, stone: 20, iron: 10 }, constructionTime: 120, minPopulation: 12 },
        { type: "mill", cost: { wood: 20, stone: 10, cereals: 5 }, constructionTime: 120, minPopulation: 15 },
        { type: "granary", cost: { wood: 20, stone: 20 }, constructionTime: 120, minPopulation: 18 },
        { type: "warehouse", cost: { wood: 15, stone: 15 }, constructionTime: 60, minPopulation: 20 },
    ],
    medium: [
        { type: "textile_mill", cost: { wood: 10, stone: 20, cotton: 20 }, constructionTime: 60, minPopulation: 12 },
        { type: "lumber_mill", cost: { wood: 15, stone: 10, tools: 2 }, constructionTime: 120, minPopulation: 15 },
        { type: "dockyard", cost: { wood: 30, stone: 10, iron: 5 }, constructionTime: 180, minPopulation: 15 },
        { type: "shipyard", cost: { wood: 30, stone: 10, iron: 5, fabric: 5 }, constructionTime: 180, minPopulation: 18 },
        { type: "clothing_workshop", cost: { wood: 20, stone: 10, wool: 10, fabric: 5 }, constructionTime: 120, minPopulation: 15 },
        { type: "sheep_ranches", cost: { wood: 10, stone: 10 }, constructionTime: 60, minPopulation: 15 },
        { type: "brewery", cost: { wood: 25, stone: 10 }, constructionTime: 240, minPopulation: 15 },
        { type: "coffee_workshop", cost: { wood: 20, stone: 10, coffee: 20 }, constructionTime: 240, minPopulation: 15 },
    ],
    low: [
        { type: "barracks", cost: { wood: 30, stone: 30, iron: 20 }, constructionTime: 120, minPopulation: 20 },
        { type: "watchtower", cost: { wood: 15, stone: 15 }, constructionTime: 120, minPopulation: 25 },
        { type: "armory", cost: { wood: 50, stone: 50, iron: 50 }, constructionTime: 300, minPopulation: 25 },
        { type: "tobacco_workshop", cost: { wood: 20, stone: 10, tobacco: 20 }, constructionTime: 240, minPopulation: 25 },
        { type: "cacao_workshop", cost: { wood: 20, stone: 10, cacao: 20 }, constructionTime: 240, minPopulation: 25 },
        { type: "jewelry_workshop", cost: { wood: 50, stone: 30, tools: 5 }, constructionTime: 300, minPopulation: 25 },
        { type: "townhall", cost: { wood: 25, stone: 25 }, constructionTime: 360, minPopulation: 30 },
        { type: "theater", cost: { wood: 30, stone: 30, fabric: 10 }, constructionTime: 360, minPopulation: 40 },
        { type: "perfume_workshop", cost: { wood: 15, stone: 10, flowers: 10 }, constructionTime: 400, minPopulation: 50 },
    ],
}
const buildingWorkersLevel = {
    "townhall" : [{level: 1, workerType: "peasant"},
        {level: 2, workerType: "peasant"},
        {level: 3, workerType: "peasant"}],
    "farm" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "master_Farmer"}],
    "mine" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "miner"}],
    "livestock_ranches" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "rancher"}],
    "fishing_hut" : [{level: 1, workerType: "hookman"},
        {level: 2, workerType: "netter"},
        {level: 3, workerType: "fisherman"}],
    "lumberjack_hut" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "lumberjack"}],
    "lumber_mill" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "sawyer"}],
    "quarry" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "stonemason"}],
    "forge" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "blacksmith"}],
    "mill" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "miller"}],
    "market" : [{level: 1, workerType: "merchant"},
        {level: 2, workerType: "broker"},
        {level: 3, workerType: "administrator"}],
    "port" : [{level: 1, workerType: "dockhand"},
        {level: 2, workerType: "longshoreman"},
        {level: 3, workerType: "foreman"}],
    "ship" : [{level: 1, workerType: "deckhand"},
        {level: 2, workerType: "sailor"},
        {level: 3, workerType: "capitain"}],
    "sheep_ranches" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "herdsman"}],
    "textile_mill" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "weaver"}],
    "shipyard" :  [{level: 1, workerType: "learner"},
        {level: 2, workerType: "carpenter"},
        {level: 3, workerType: "master_builder"}],
    "dockyard" :  [{level: 1, workerType: "learner"},
        {level: 2, workerType: "carpenter"},
        {level: 3, workerType: "master_shipwright"}],
    "clothing_workshop" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "tailor"}],
    "brewery" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "brewer"}],
    "tobacco_workshop" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "tobacconist"}],
    "cacao_workshop" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "chocolatier"}],
    "coffee_workshop" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "coffee_roaster"}],
    "jewelry_workshop" : [{level: 1, workerType: "workman"},
        {level: 2, workerType: "learner"},
        {level: 3, workerType: "jeweller"}],
}
const workersConsumption = {
    peasant: { food: 1 },
    workman: { food: 1 },
    learner: { food: 2, clothes: 1 },
    deckhand: { food: 2},
    dockhand: { food: 2},
    farmer: { food: 2, clothes: 1 }, 
    master_Farmer: { food: 2, clothes: 1, chocolate: 1 }, 
    miller: { food: 2, clothes: 1, ground_coffee: 1 }, 
    hookman: { food: 1}, // Pêcheur à la ligne
    netter: { food: 2, clothes: 1}, 
    fisherman: { food: 2, clothes: 1, chocolate: 1 }, 
    seaman: { food: 2, clothes: 1, liquor: 1 }, 
    longshoreman: { food: 2, clothes: 1, chocolate: 1 },
    foreman: { food: 2, clothes: 1, cigars: 1 },
    carpenter: { food: 2, clothes: 1, liquor: 1 },
    master_shipwright: { food: 2, clothes: 1, cigars: 1 },
    miner: { food: 2, liquor: 1 }, 
    lumberjack: { food: 2, clothes: 1, chocolate: 1 }, 
    sawyer: { food: 2, clothes: 1, cigars: 1 }, 
    blacksmith: { food: 2, clothes: 1, liquor: 1 }, 
    master_builder: { food: 2, clothes: 1, cigars: 1 }, 
    maneuver: { food: 2, ground_coffee: 1 }, 
    rancher: { food: 2, clothes: 1 }, 
    herdsman: { food: 2, clothes: 1 },
    stonemason: { food: 2, ground_coffee: 1 }, 
    sailor: { food: 2, liquor: 1 }, 
    capitain: { food: 2, liquor: 1, jewelry: 1 }, 
    merchant: { food: 2, clothes: 1, ground_coffee: 1 }, 
    broker: { food: 1, chocolate: 1, jewelry: 1 }, 
    administrator: { food: 1, cigars: 1, jewelry: 1 }, 
    weaver: { food: 2, ground_coffee: 1, jewelry: 1 }, 
    tailor: { food: 2, clothes: 1, chocolate: 1 }, 
    brewer: { food: 2, clothes: 1, cigars: 1 }, 
    tobacconist: { food: 2, chocolate: 1, liquor: 1 }, 
    coffee_roaster: { food: 2, ground_coffee: 1, jewelry: 1 }, 
    chocolatier: { food: 2, clothes: 1, chocolate: 1 }, 
    jeweller: { food: 2, clothes: 1, jewelry: 1 }, 
}
const constructionPrerequisites = {
    "farm" :  [ {resources: ["sugar_cane", "vine", "orchards", "tobacco", "coffee", "cacao", "banana", "cotton", "cereals"]} ],
    "mine" :  [ {resources: ["gems_purple", "gems_green", "gems_blue", "gold", "silver", "iron", "copper", "coal"]} ],
    "livestock_ranches" : [ {resources: ["meat"]} ],
    "fishing_hut" :  [ {resources: ["fish"]} ],
    "lumberjack_hut" :  [ {resources: ["wood"]} ],
    "quarry" :  [ {resources: ["stone"] }],
    "mill" :  [ {resources: ["cereals"], level:1} ],
    "granary" : [], 
    "market" : [ {building: ["warehouse"], level:1} ], 
    "warehouse" : [], 
    "port" : [ {building: ["market"], level:1} ],
    "sheep_ranches" :  [ {resources: ["wool"]} ],
    "barracks" : [],
    "watchtower" :  [ {building: ["barracks"], level:1} ],
    "armory" :  [ {building: ["barracks", "warehouse"], level:2} ],
    "dockyard" :  [ {resources: ["wood"], building: ["port"], level:1} ],
    "shipyard" :  [
        {building: ["port", "lumber_mill"], level:1},
        {building: ["port", "warehouse", "townhall"], level:2},
    ],
    "forge" :  [
        { resources: ["iron", "copper", "coal"], building: ["mine"], level:1},
        {building: ["port", "warehouse"], level:2},
    ],
    "textile_mill" : [
        {resources: ["cotton"], building: ["farm"], level:1},
        {building: ["port", "warehouse"], level:2},
    ],
    "lumber_mill" : [
        {building: ["lumberjack_hut"], level:1},
        {building: ["port", "warehouse"], level:2},
    ],
    "clothing_workshop" : [
        {resources: ["wool"], building: ["sheep_ranches"], level:1},
        {building: ["port", "warehouse"], level:2},
    ],
    "brewery" : [
        {resources: ["sugar_cane", "vine"], building: ["farm"], level:1},
        {building: ["port", "warehouse"], level:2},
    ],
    "coffee_workshop" : [
        {resources: ["coffee"], building: ["farm"], level:1},
        {building: ["port", "warehouse", "market"], level:2},
    ],
    "cacao_workshop" : [
        {resources: ["cacao"], building: ["farm"], level:1},
        {building: ["port", "warehouse", "market"], level:2},
    ],
    "tobacco_workshop" : [
        {resources: ["tobacco"], building: ["farm"], level:1},
        {building: ["port", "warehouse", "market"], level:2},
    ],
    "jewelry_workshop" : [
        {resources: ["gems_purple", "gems_green", "gems_blue", "gold", "silver"], building: ["mine"], level:1},
        {building: ["port", "warehouse", "market", "townhall"], level:2},
    ],
    "perfume_workshop": [ {building: ["port", "warehouse", "market", "townhall"], level:3} ],
    "theater" :  [ {building: ["port", "warehouse", "market", "townhall"], level:3} ],
}
const workshopProduction = {
    "lumber_mill": [ // wood: 10, tools: 15, lumber: 20
        { resources: { wood: 4 }, minLevel: 1, result: { type: "lumber", quantity: 2.1 }},
        { resources: { wood: 2, tools: 1 }, minLevel: 2, result: { type: "lumber", quantity: 2.8 }},
    ],
    "forge": [ // iron: 25, copper: 25, coal: 20, wood: 10, tools: 15
        { resources: { iron: 1, wood: 3 }, minLevel: 1, result: { type: "tools", quantity: 4.5 }},
        { resources: { copper: 1, wood: 3 }, minLevel: 1, result: { type: "tools", quantity: 4.5 }},
        { resources: { iron: 1, coal: 1, wood: 1 }, minLevel: 2, result: { type: "tools", quantity: 6 }},
        { resources: { iron: 1, coal: 1, wood: 1, tools: 1 }, minLevel: 2, result: { type: "tools", quantity: 9 }},
        { resources: { copper: 1, coal: 1, wood: 1 }, minLevel: 3, result: { type: "tools", quantity: 6 }},
        { resources: { copper: 1, coal: 1, wood: 1, tools: 1 }, minLevel: 3, result: { type: "tools", quantity: 9 }},
        /* { resources: { iron: 3, coal: 2, wood: 1 }, minLevel: 2, result: { type: "spear", quantity: 1.8 }},
        { resources: { iron: 5, coal: 2}, minLevel: 3, result: { type: "shield", quantity: 1.8 }}, */
    ],
    "textile_mill": [ // cotton: 15, fabric: 25, tools: 15 
        { resources: { cotton: 3 }, minLevel: 1, result: { type: "fabric", quantity: 2.1 }},
        { resources: { cotton: 2, tools: 1 }, minLevel: 2, result: { type: "fabric", quantity: 3.5 }},
        { resources: { cotton: 2, tools: 3 }, minLevel: 3, result: { type: "fabric", quantity: 8.7 }},
    ],
    "clothing_workshop" : [ // wool: 15, cotton: 15, fabric: 25, tools: 15,  clothes: 30,
        { resources: { wool: 3 }, minLevel:1, result: { type: "clothes", quantity: 3.6 }},
        { resources: { cotton: 3 }, minLevel:1, result: { type: "clothes", quantity: 3.6 }},
        { resources: { wool: 2, tools: 1 }, minLevel:2, result: { type: "clothes", quantity: 5 }},
        { resources: { cotton: 2, tools: 1 }, minLevel:2, result: { type: "clothes", quantity: 5 }},
        { resources: { wool: 1, cotton: 1, tools: 2 }, minLevel:2, result: { type: "clothes", quantity: 7.2 }},
        { resources: { fabric: 1 }, minLevel:3, result: { type: "clothes", quantity: 5 }},
        { resources: { fabric: 1, tools: 1 }, minLevel:3, result: { type: "clothes", quantity: 10 }},
    ],
    "armory": [ // iron: 25, coal: 20, wood: 10, tools: 15
        { resources: { iron: 6, coal: 4, wood: 2 }, minLevel: 1, result: { type: "rifle", quantity: 7.6 }},
        { resources: { iron: 4, coal: 2, wood: 2, tools: 4 }, minLevel: 2, result: { type: "rifle", quantity: 11.7 }},
        { resources: { iron: 12, coal: 10, wood: 4 }, minLevel: 1, result: { type: "artillery", quantity: 7.6 }},
        { resources: { iron: 10, coal: 8, wood: 4, tools: 4 }, minLevel: 3, result: { type: "artillery", quantity: 11.7 }},
    ],
    "brewery": [ // sugar_cane: 20, vine: 20, liquor: 30, tools: 15
        { resources: { sugar_cane: 2, vine: 2}, minLevel: 1, result: { type: "liquor", quantity: 3.8 }},
        { resources: { sugar_cane: 2, vine: 2, tools: 1 }, minLevel: 2, result: { type: "liquor", quantity: 4.3 }},
        { resources: { sugar_cane: 1, vine: 1, tools: 2}, minLevel: 2, result: { type: "liquor", quantity: 4.3 }},
        { resources: { sugar_cane: 3, tools: 3 }, minLevel: 3, result: { type: "liquor", quantity: 7.6 }},
        { resources: { vine: 3, tools: 3 }, minLevel: 3, result: { type: "liquor", quantity: 7.6 }},
    ],
    "tobacco_workshop" : [ // tobacco: 20, tools: 15, cigars: 40
        { resources: { tobacco: 4}, minLevel:1, result: { type: "cigars", quantity: 4.4 }},
        { resources: { tobacco: 2, tools: 2 }, minLevel:2, result: { type: "cigars", quantity: 5 }},
    ],
    "cacao_workshop" : [ // cacao: 20, tools: 15, chocolate: 35
        { resources: { cacao: 4}, minLevel:1, result: { type: "chocolate", quantity: 4.8 }},
        { resources: { cacao: 2, tools: 2 }, minLevel:2, result: { type: "chocolate", quantity: 5.6 }},
    ],
    "coffee_workshop" : [ // coffee: 20, tools: 15, ground_coffee: 30
        { resources: { coffee: 4}, minLevel:1, result: { type: "ground_coffee", quantity: 5.8 }},
        { resources: { coffee: 2, tools: 2 }, minLevel:2, result: { type: "ground_coffee", quantity: 6.1 }},
    ],
    "jewelry_workshop": [ // gems_purple: 120, gems_green: 90, gold: 100, silver: 40, tools: 15
        { resources: { gold: 2 }, minLevel: 1, result: { type: "jewelry", quantity: 3.2 }},
        { resources: { gold: 2, tools: 1 }, minLevel: 1, result: { type: "jewelry", quantity: 3.5 }},
        { resources: { gold: 2, silver: 1}, minLevel: 1, result: { type: "jewelry", quantity: 3.9 }},
        { resources: { gold: 2, silver: 1, tools: 2 }, minLevel: 2, result: { type: "jewelry", quantity: 4.6 }},
        { resources: { gold: 2, gems_blue: 1, tools: 3 }, minLevel: 2, result: { type: "jewelry", quantity: 5.8 }},
        { resources: { gold: 2, gems_green: 1, tools: 3 }, minLevel: 3, result: { type: "jewelry", quantity: 6.5 }},
        { resources: { gold: 1, gems_purple: 1, tools: 5 }, minLevel: 3, result: { type: "jewelry", quantity: 6.9 }},
    ],
};

const torn_Kingdom_maps = {
    kingdom:[
        [{x:2, y: 26},{x:2, y: 27},{x:2, y: 28},{x:2, y: 29},{x:3, y: 30}],
        [{x:6, y: 20},{x:6, y: 21}],
        [{x:6, y: 25},{x:6, y: 26},{x:6, y: 27},{x:7, y: 25},{x:8, y: 25}],
        [{x:10, y: 17},{x:11, y: 17},{x:11, y: 18},{x:10, y: 19},{x:10, y: 20},{x:11, y: 20}],
        [{x:12, y: 25},{x:12, y: 26},{x:12, y: 27},{x:12, y: 28},{x:11, y: 29}],
        [{x:7, y: 33},{x:8, y: 34},{x:9, y: 34},{x:10, y: 34},{x:9, y: 35},{x:9, y: 36},{x:10, y: 36}],
        [{x:10, y: 41},{x:10, y: 42},{x:11, y: 42},{x:11, y: 43},{x:11, y: 44},{x:10, y: 44}],
        [{x:17, y: 25},{x:16, y: 26},{x:16, y: 27},{x:17, y: 27},{x:17, y: 28}],
        [{x:15, y: 32}],
        [{x:19, y: 33}],
        [{x:15, y: 37},{x:16, y: 37},{x:17, y: 38},{x:18, y: 38}],
        [{x:16, y: 43},{x:16, y: 44}],
        [{x:21, y: 29},{x:22, y: 29},{x:23, y: 28},{x:24, y: 28},{x:24, y: 29}],
        [{x:24, y: 33},{x:25, y: 34}],
        [{x:22, y: 38},{x:22, y: 39},{x:23, y: 39}],
        [{x:22, y: 44},{x:22, y:45},{x:21, y:46},{x:23, y:45},{x:23, y: 46}],
        [{x:27, y: 20},{x:28, y: 20},{x:28, y: 21},{x:29, y: 21},{x:29, y: 22},{x:29, y: 23},{x:30, y: 23},{x:30, y: 24},{x:30, y: 25},{x:30, y: 26},{x:31, y: 26},{x:31, y: 27},{x:32, y: 27}],
        [{x:29, y: 32},{x:30, y: 33},{x:31, y: 34},{x:32, y: 34},{x:32, y: 35},{x:32, y: 36},{x:33, y: 37}],
        [{x:28, y: 39},{x:29, y: 40},{x:29, y: 41},{x:29, y: 42},{x:28, y: 43},{x:29, y: 44}],
        [{x:33, y: 41},{x:33, y: 42},{x:33, y: 43}],
        [{x:34, y: 3},{x:35, y: 3},{x:36, y: 2},{x:37, y: 3},{x:38, y: 3}],
        [{x:35, y: 7},{x:36, y: 8},{x:37, y: 7},{x:37, y: 9}],
        [{x:34, y: 13}],
        [{x:38, y: 13},{x:38, y: 14},{x:38, y: 15}],
        [{x:38, y: 19},{x:39, y: 19},{x:39, y: 20},{x:39, y: 21}],
        [{x:36, y: 31},{x:36, y: 32},{x:37, y: 33},{x:36, y: 34},{x:37, y: 35}],
        [{x:37, y: 39},{x:38, y: 39},{x:37, y: 40},{x:38, y: 40},{x:39, y: 40},{x:39, y: 41}],
        [{x:42, y: 4},{x:42, y: 5},{x:42, y: 6},{x:42, y: 7},{x:41, y: 7},{x:41, y: 8}],
        [{x:47, y: 11},{x:46, y: 11},{x:45, y: 11},{x:44, y: 12},{x:43, y: 13},{x:43, y: 14},{x:42, y: 14}],
        [{x:47, y: 15}],
        [{x:43, y: 19},{x:43, y: 20},{x:43, y: 21},{x:44, y: 21}],
        [{x:40, y: 25},{x:40, y: 26},{x:40, y: 27},{x:40, y: 28},{x:40, y: 29}],
        [{x:44, y: 27},{x:44, y: 28},{x:44, y: 29},{x:44, y: 30},{x:45, y: 30},{x:45, y: 31}],
        [{x:41, y: 33},{x:41, y: 34},{x:42, y: 34},{x:43, y: 35},{x:43, y: 36},{x:43, y: 37}],
        [{x:40, y: 45}],
        [{x:44, y: 41},{x:45, y: 42},{x:44, y: 43},{x:45, y: 43},{x:46, y: 43},{x:46, y: 44},{x:47, y: 44}]
    ],
    empire:[
        [
            {x:36, y: 2},{x:35, y: 3},{x:36, y: 4},{x:36, y: 5},{x:36, y: 6},
            {x:35, y: 7},{x:36, y: 8}
        ],
        [
            {x:42, y: 4},{x:42, y: 5},{x:42, y: 6},{x:42, y: 7}
        ],
        [
            {x:42, y: 11},{x:42, y: 12},{x:43, y: 13},{x:42, y: 14},{x:43, y: 15}
        ],
        [
            {x:43, y: 19},{x:43, y: 20},{x:43, y: 21},{x:44, y: 21}
        ],
        [
            {x:46, y: 10},{x:47, y: 11},
        ],
        [
            {x:35, y: 14},{x:36, y: 14},{x:37, y: 14}
        ],
        [
            {x:37, y: 19},{x:38, y: 20}
        ],
        [
            {x:39, y: 25},{x:39, y: 26},{x:39, y: 27},{x:39, y: 28}
        ],
        [
            {x:38, y: 32},{x:37, y: 32},{x:37, y: 33},{x:37, y: 34},{x:37, y: 35}
        ],
        [
            {x:38, y: 40},{x:38, y: 41}
        ],
        [
            {x:40, y: 45}
        ],
        [
            {x:44, y: 27},{x:45, y: 28},{x:44, y: 29},{x:44, y: 30},{x:44, y: 31},{x:45, y: 32}
        ],
        [
            {x:44, y: 36},{x:44, y: 37},{x:45, y: 38},{x:44, y: 39}, {x:44, y: 40}
        ],
        [
            {x:45, y: 44},{x:44, y: 45},{x:45, y: 45},{x:46, y: 45},{x:46, y: 46},{x:47, y: 46}
        ],
        [
            {x:28, y: 21},{x:29, y: 22},{x:29, y: 23},{x:30, y: 24},{x:30, y: 25},{x:31, y: 26}
        ],
        [
            {x:18, y: 27},{x:19, y: 27},{x:20, y: 27},{x:20, y: 28}
        ],
        [
            {x:24, y: 29},{x:24, y: 30},{x:24, y: 31}
        ],
        [
            {x:28, y: 31},{x:28, y: 32},{x:29, y: 33},{x:30, y: 34}
        ],
        [
            {x:32, y: 39},{x:33, y: 40},{x:33, y: 41},{x:33, y: 42},{x:33, y: 43}
        ],
        [
            {x:20, y: 35},{x:21, y: 35},{x:22, y: 36},{x:23, y: 37},{x:24, y: 37},{x:25, y: 37}
        ],
        [
            {x:27, y: 43},{x:28, y: 44},{x:29, y: 44}
        ],
        [
            {x:20, y: 42},{x:20, y: 43},{x:20, y: 44},{x:21, y: 45},{x:22, y: 46},{x:23, y: 46}
        ],
        [
            {x:12, y: 19},{x:12, y: 18},{x:11, y: 17},{x:10, y: 16},{x:9, y: 17}
        ],
        [
            {x:6, y: 21},{x:7, y: 22},{x:6, y: 23},{x:6, y: 24},{x:6, y: 25},{x:7, y: 26},{x:7, y: 27}
        ],
        [
            {x:12, y: 25},{x:13, y: 26},{x:12, y: 27},{x:12, y: 28}
        ],
        [
            {x:2, y: 27},{x:2, y: 28},{x:3, y: 29}
        ],
        [
            {x:6, y: 32},{x:7, y: 33},{x:8, y: 34},{x:9, y: 35}
            
        ],
        [
            {x:14, y: 33},{x:15, y: 34},{x:14, y: 35},{x:15, y: 36},{x:16, y: 37}
        ],
        [
            {x:10, y: 40},{x:10, y: 41},{x:10, y: 42}
        ],
        [
            {x:15, y: 43},{x:15, y: 44},{x:16, y: 45}
        ]
    ]
}

const noNeedWorkersPlace = ["townhall", "warehouse", "granary", "barracks", "theater","market","port"];

const resourcesFacilities = ["farm", "livestock_ranches", "quarry", "lumberjack_hut", "fishing_hut", "mine"];

const stableResources = ["gold", "silver", "gems_blue", "gems_green", "gems_purple"];
const resources = [
    "gems_purple","gems_green","gems_blue","gold","silver","iron","copper","coal","cotton","wool","banana","orchards","meat","cereals","fish",
];
const resourcesUnavailable = [ "gems_purple","gems_green","gems_blue","gold","silver","iron","copper","coal" ];

const agriFoodResources = [ "banana","orchards","meat","cereals","fish" ];
const strategicResources = [ "iron","copper","coal","stone","wood","cotton","wool" ];
const luxuryResources = [ "gems_purple","gems_green","gems_blue","gold","silver","sugar_cane","vine","tobacco","coffee","cacao"];