
function calculateDistanceFromCenter(x, y) {
    const centerX = gridSize.x / 2;
    const centerY = gridSize.y / 2;
    return Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
}
function adjustRarityByDistance(rarity, distance, maxDistance) {
    const adjustmentFactor = distance / maxDistance; // Valeur entre 0 et 1
    return Object.fromEntries(
        Object.entries(rarity).map(([resource, weight]) => {
            const adjustedWeight = weight * (1 + adjustmentFactor); // Augmente les poids avec la distance
            return [resource, adjustedWeight];
        })
    );
}
function adjustRarityByTerrain(rarity, terrainType) {
    const terrainFactors = {
        "plain": 1,          // Aucune modification
        "hill": 1.2,         // Légèrement plus favorable
        "mountain": 1.5,     // Favorise fortement les métaux et gemmes
        "desert": 0.8,       // Diminue la probabilité globale
        "oasis": 0.8,       // Diminue la probabilité globale
        "river": 1.3,        // Favorise les resources aquatiques
        "corner": 1,        // Favorise les resources aquatiques
        "embouchure": 1.3,        // Favorise les resources aquatiques
    };

    const factor = terrainFactors[terrainType] || 1; // Valeur par défaut si le terrain n'est pas trouvé
    return Object.fromEntries(
        Object.entries(rarity).map(([resource, weight]) => {
            const adjustedWeight = weight * factor;
            return [resource, adjustedWeight];
        })
    );
}
function calculateAdjustedRarity(x, y, terrainType, resourceRarity) {
    const distance = calculateDistanceFromCenter(x, y);
    const maxDistance = Math.sqrt(Math.pow(gridSize.x / 2, 2) + Math.pow(gridSize.y / 2, 2));

    let adjustedRarity = adjustRarityByDistance(resourceRarity, distance, maxDistance);
    adjustedRarity = adjustRarityByTerrain(adjustedRarity, terrainType);

    return adjustedRarity;
}
function getRandomName() {

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const mid = syllables[Math.floor(Math.random() * syllables.length)];
    const co = connectors[Math.floor(Math.random() * connectors.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return Math.random() > 0.7
        ? `${prefix}-${mid}${suffix}`
        : `${prefix} ${co}${suffix}`;
}   
function getDirections(){
    const directions = [
        { dx: -1, dy: 0, type: 'nord' },
        { dx: 1, dy: 0, type: 'sud' },
        { dx: 0, dy: 1, type: 'est' },
        { dx: 0, dy: -1, type: 'ouest' },
        { dx: -1, dy: -1, type: 'nord-ouest' },
        { dx: -1, dy: 1, type: 'nord-est' },
        { dx: 1, dy: -1, type: 'sud-ouest' },
        { dx: 1, dy: 1, type: 'sud-est' }
    ];
    return directions;
}
function getRandomType(type) {
    const options = {
        capital: ["plain", "hill"],
        land: ["plain", "hill", "mountain", "deser", "oasis"],
        beach: ["1", "3", "4"],
        corner: ["1", "2", "3"],
        river: ["1", "2", "3", "4"],
        embouchure: ["1", "2", "3"],
    };
    const landWeight = {
        plain: 1.5, // Fréquent
        hill: 0.6,
        mountain: 0.5,
        oasis: 0.3,
        deser: 0.2 // Moyennement rare
    };

    if (type !== "land") {
        return options[type][Math.floor(Math.random() * options[type].length)];
    }

    // Distribution pondérée pour les terres
    const totalWeight = options.land.reduce((sum, key) => sum + landWeight[key], 0);
    let randomValue = Math.random() * totalWeight;

    for (const landType of options.land) {
        randomValue -= landWeight[landType];
        if (randomValue <= 0) {
            return landType;
        }
    }
}
function matchesPattern(adjacent, patterns) {
    return patterns.some(pattern => JSON.stringify(pattern) === JSON.stringify(adjacent));
}
function getNearbyResources(villagePos, island, radius = 1) {
    const { x, y } = villagePos;
    const nearbyResources = [];
    const landAround = getDirections();
    // Fonction de mélange (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            // Choisir un index aléatoire entre 0 et i
            const j = Math.floor(Math.random() * (i + 1));
            // Échanger les éléments array[i] et array[j]
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    // Mélanger les directions
    const shuffledLandAround = shuffleArray([...landAround]);
    shuffledLandAround.unshift({ dx: 0, dy: 0, type: '' });
    shuffledLandAround.forEach(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (island?.resources[nx]?.[ny]) {
            nearbyResources.push(...island.resources[nx][ny]);
        }
    });
    return nearbyResources;
}
function amenagementForResource(resource = null, amenagement = false){
    const amenagements = {
        mine : ["gold", "silver", "iron", "coal","copper","gems_purple","gems_green","gems_blue"],
        fishing_hut : ["fish"], lumberjack_hut : ["wood"], livestock_ranches : ["meat"], sheep_ranches : ["wool"], quarry : ["stone"],
        farm : ["sugar_cane", "vine", "orchards", "tobacco", "coffee", "cacao", "banana", "cotton", "cereals"] }
    for (const [key, value] of Object.entries(amenagements)) { 
        if (amenagement && amenagement === key) { return true; }
        if(resource && value.includes(resource)) { return key; } 
    }
    return false;
}
function buildingCategory(building){
    const buildings = {
        amenagement : ["mine", "fishing_hut", "lumberjack_hut", "livestock_ranches","sheep_ranches","quarry","farm"],
        workshop : ["forge", "textile_mill", "lumber_mill", "clothing_workshop", "brewery", "coffee_workshop", "cacao_workshop", "tobacco_workshop", "jewelry_workshop", "perfume_workshop"],
        infrastructure : ["townhall", "market", "port", "mill", "granary", "warehouse", "barracks", "watchtower", "armory", "dockyard", "shipyard", "theater"] }
    
        for (const [key, value] of Object.entries(buildings)) { if(value.includes(building)){ return key; } }
        return false;
}
function amenagementProduction(type){
    const amenagements = { 
        // Bâtiments non productifs
        townhall: 0, 
        warehouse: 0, 
        granary: 0, 
        watchtower: 0, 
        barracks: 0, 

        // Bâtiments de production de base
        farm: 1.0, 
        fishing_hut: 0.8, 
        lumberjack_hut: 0.8, 
        livestock_ranches: 0.9, 
        sheep_ranches: 0.9, 
        quarry: 0.8, 
        mine: 0.8, 

        // Bâtiments de transformation et avancés
        mill: 1.5, 
        lumber_mill: 1.2, 
        forge: 1.1, 
        textile_mill: 1.1, 
        clothing_workshop: 1.1, 
        brewery: 1.1, 
        tobacco_workshop: 1.1, 
        cacao_workshop: 1.1, 
        coffee_workshop: 1.1, 
        jewelry_workshop: 0.9, 

        // Bâtiments spécialisés
        market: 0.9, 
        port: 0.9, 
        dockyard: 1.1, 
        shipyard: 1.1, 
        armory: 0.8,
    };
    return amenagements[type];
}
function getBuildingInfo(buildingType, info) {
    const allBuildings =  [...constructionPriorities.high, ...constructionPriorities.medium, ...constructionPriorities.low];
    const building = allBuildings.find(building => building.type === buildingType);
    switch (info) {
        case "cost":
            return building.cost;
            break;
        case "constructionTime":
            return building.constructionTime;
            break;
        case "minPopulation":
            return building.minPopulation;
            break;
    
        default:
            return building;
            break;
    }
}
function determinePrice(resourceType) {
    return basePrices[resourceType] || 10; // Prix par défaut
}
/* function findNearbyMarket(village) {
    const port = village.amenagements.find(a => a.type === "port");
    const range = port ? port.range : 10;

    const localMarkets = allMarkets.filter(market => {
        const distance = calculateTravelTime(village.villagePos, market.place);
        return (market.islandID === village.islandID && market.villageID !== village.id) ||
            (port && market.villageID !== village.id && distance <= range);
    });
    return localMarkets.sort((a, b) => calculateTravelTime(village.villagePos, a.place) - calculateTravelTime(village.villagePos, b.place));
} */
function findNearbyMarket(village, priceFluctuation = false) {
    const port = village.amenagements.find(a => a.type === "port");
    const range = priceFluctuation? (gridSize.y / 4):
                port ? port.range : 10;
    const worldHeight = gridSize.y;

    const localMarkets = allMarkets.filter(market => {
        let distance = calculateTravelTime(village.villagePos, market.place);

        // Vérification avec le wrap-around
        const distanceWrapY = calculateTravelTime({ x: village.villagePos.x, y: (village.villagePos.y + worldHeight) % worldHeight }, market.place);

        return (market.islandID === village.islandID && market.villageID !== village.id) ||
                (port && market.villageID !== village.id && (distance <= range || distanceWrapY <= range));
    });

    return localMarkets.sort((a, b) => calculateTravelTime(village.villagePos, a.place) - calculateTravelTime(village.villagePos, b.place));
}
const pathCache = new Map();
function simulateTravel(startPort, buyerName, endPort, sellerName, ship, onCompletion) {
    if (ship.underRepair) return;
    const worldHeight = gridSize.y;
    const cardinaux = {
        "nord": 0,
        "sud": 180,
        "est": 90,
        "ouest": 270,
        "nord-est": 45,
        "sud-est": 135,
        "nord-ouest": 315,
        "sud-ouest": 225,
    }
    let start = { x: startPort.x, y: startPort.y, orientation: 60 }; // Position de départ
    const end = { x: endPort.x, y: endPort.y }; // Position d'arrivée
    const targetCell = document.getElementById(`cell-${end.x}x${end.y}`);

    const key = `${start.x},${start.y}-${end.x},${end.y}`;

    // Vérifie si le wrap-around est plus court
    const normalDistance = calculateTravelTime(start, end);
    const wrapDistanceY = calculateTravelTime({ x: start.x, y: (start.y + worldHeight) % worldHeight }, end);
    
    if (wrapDistanceY < normalDistance) {
        start.y = (start.y + worldHeight) % worldHeight;
    }

    const path = [];
    $(`#${ship.id}`)
            .fadeIn(1500)
            .attr(`fromTo`,`from:${buyerName} to:${sellerName}`);
    const directions = getDirections(); // Obtenir les directions possibles (nord, sud, est, ouest, diagonales)
    // Déplacement étape par étape
    function moveStep(currentPos) {
        let possibleSteps = [];
        let dir = "";
        let wrap = false;
        let captainManeuverTime = 0;
        directions.forEach(({ dx, dy, type }) => {
            // let newX = (currentPos.x + dx + worldWidth) % worldWidth;
            let newY = (currentPos.y + dy + worldHeight) % worldHeight;

            const nStep = { x: currentPos.x + dx, y: newY };
            
            if ( grid[nStep.x]?.[nStep.y] !== "land" && grid[nStep.x]?.[nStep.y] !== "beach" || 
            (nStep.x === end.x && nStep.y === end.y) || 
            (nStep.x === start.x && nStep.y === start.y)
            ) {
                const distance = calculateTravelTime(nStep, end);
                possibleSteps.push({ x:nStep.x, y:nStep.y, distance, type: type});
                possibleSteps = possibleSteps.filter(possi => !path.some(pa => pa.x === possi.x && pa.y === possi.y));
            }
        });
        if (possibleSteps.length > 0) {
            // Choisit la case avec la distance minimale
            const nextStep = possibleSteps.reduce((best, current) =>
                current.distance < best.distance ? current : best
            );
            dir = nextStep.type;
            
            let newAngle = cardinaux[dir];
            let rotationDifference = ((newAngle - currentPos.orientation + 540) % 360) - 180; // Rotation sòf
            // Met à jour la position actuelle
            
            if ( (start.y === 0 && nextStep.y === (gridSize.y - 1)) || (start.y === (gridSize.y - 1) && nextStep.y === 0) ) {
                wrap = true;
                $(`#${ship.id}`).fadeTo(100, 0);
            }
            start = {x: nextStep.x, y: nextStep.y, orientation: (currentPos.orientation + rotationDifference)};
            path.push({ ...start });
                captainManeuverTime = Math.abs( rotationDifference * 10 );
                $(`#${ship.id}`)
                .css({
                    "display": wrap? "none": "block", 
                    "transition": `transform ${captainManeuverTime}ms ease-out`,
                    "transform-origin": "center center", 
                    "transform": `rotate(${start.orientation}deg) translate(0%, 20%)`
                });
                if (wrap) {
                    $(`#${ship.id}`).fadeTo(100, 0);
                }

                $(`#${ship.id}`)
                    .animate({
                        top: `${start.x * cellSize}px`,
                        left: `${start.y * cellSize}px`,
                    },
                    2500,
                    'linear',
                    () => {
                        
                        ship.calculateDamage();
                        if (wrap) {
                            $(`#${ship.id}`).fadeTo(500, 1);
                        }
                        
                        if (isShipInsideCell(ship, targetCell)) {
                            $(`#${ship.id}`).fadeOut(250);
                            pathCache.set(key, path);
                            // console.log('Arrivée atteinte !');
                            onCompletion();
                            return;
                        }
                        // Prochaine étape
                        moveStep(start);
                    }
                );
        } else {
        }
    }
    moveStep(start);
}
function isShipInsideCell(ship, cell) {
    // const shipId = $(`#${ship.id}`).attr
    const ship_ = document.getElementById(`${ship.id}`);
    const shipRect = ship_.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();

    return !( shipRect.right < cellRect.left || shipRect.left > cellRect.right ||
        shipRect.bottom < cellRect.top || shipRect.top > cellRect.bottom );
}
async function animatePath(ship, path, onCompletion) {
    for (const step of path) {
        let wrap = false;
        ship.calculateDamage();
        if ( step.y === 0 || step.y === (gridSize.y - 1) ) {
            wrap = true;
            $(`#${ship.id}`).fadeTo(100, 0);
        }else{
            wrap = false;
            $(`#${ship.id}`).fadeTo(100, 1);
        }
        await new Promise(resolve => {
            $(`#${ship.id}`).fadeIn(1500).css({
                "display": wrap? "none": "block",
                "transition": `transform 100ms ease-out`,
                "transform-origin": "center center", 
                "transform":`translate(0%, 20%) rotate(${step.orientation}deg)`
            }).animate(
                { top: `${step.x * cellSize}px`, left: `${step.y * cellSize}px` },
                2500,
                "linear",
                resolve
            );
        });
    }
    // Appeler la fonction de fin d'animation
    if (onCompletion) {
        $(`#${ship.id}`).fadeOut(250);
        onCompletion();
    }
}
function completeTheTransaction(villageBuyer, marketBuyer, villageSeller, marketSeller, transportUnit){
    marketBuyer.buyOrders.forEach(buyOrder => {
        marketSeller.sellOrders.forEach(salesOffer => {
            if (buyOrder.type === salesOffer.type && buyOrder.quantity > 0 && salesOffer.quantity > 0 && salesOffer.soldTo === villageBuyer.id) {
                const qtyToBuy = Math.floor(Math.min(
                    buyOrder.quantity,
                    salesOffer.quantity,
                    transportUnit.cargo.capacity - transportUnit.cargo.stock.reduce((sum, item) => sum + item.quantity, 0)
                ));
                const cost = qtyToBuy * salesOffer.price;
                if (qtyToBuy > 0 && villageBuyer.gold >= cost) {
                    villageBuyer.gold -= cost;
                    villageSeller.gold += cost;
                    transportUnit.addToCargo(salesOffer.type, qtyToBuy);
                    buyOrder.quantity -= qtyToBuy;
                    salesOffer.quantity -= qtyToBuy;

                    if (salesOffer.quantity > 0) salesOffer.soldTo = null;
                    if (buyOrder.quantity > 0) buyOrder.buyFrom = null;
                    if (salesOffer.quantity <= 0) marketSeller.sellOrders = marketSeller.sellOrders.filter(order => order.quantity > 0);
                    if (buyOrder.quantity <= 0) marketBuyer.buyOrders = marketBuyer.buyOrders.filter(order => order.quantity > 0);
                }else{
                    salesOffer.soldTo = null;
                }
            }
        });
    });
}
function returnTransport(villageBuyer, transportUnit) {
    const warehouse = villageBuyer.amenagements.find(a => a.type === "warehouse");
    transportUnit?.cargo?.stock.forEach(resource => {
        warehouse.addToStock(resource.type, resource.quantity);
    });
    transportUnit?.clearCargo(); // Vide le cargo et réinitialise l'état du navire
    transportUnit.busy = false;
}
/* function calculateTravelTime(startPos, endPos) {
    const dx = Math.abs(startPos.x - endPos.x);
    const dy = Math.abs(startPos.y - endPos.y);
    return (dx + dy) * 1; // 1 heure par cellule
} */
function calculateTravelTime(start, end) {
    const dx = Math.abs(start.x - end.x);
    const dy = Math.abs(start.y - end.y);
    // const worldWidth = gridSize.x; // Largeur de la carte
    const worldHeight = gridSize.y; // Hauteur de la carte

    // Vérifier si le wrap-around est plus court
    // const dxWrap = Math.min(dx, worldWidth - dx);
    const dyWrap = Math.min(dy, worldHeight - dy);

    return (dx + dyWrap) * 1; // Distance avec le wrap-around pris en compte
}
function calculateToricDistance(start, end) {
    let dx = Math.abs(end.x - start.x);
    let dy = Math.abs(end.y - start.y);

    // Wrap-around horizontal (si la carte est torique sur l'axe X)
    let dyWrap = gridSize.y - dy;
    let minDy = Math.min(dy, dyWrap);

    return dx + minDy;
}
function addBuildingToQueue(village, building, priority, specialization = false) {
    const urgentNeeds = village.agriFoodNeeds;
    const warehouse = village.amenagements.find(a => a.type === "warehouse");
    // Vérifie si le bâtiment est déjà dans la file d'attente
    if (village.constructionQueue.some(q => q.type === building.type && q?.resourceId === building?.resourceId)) {
        // console.warn(`${building.type} est déjà dans la file d'attente pour ${this.name}.`);
        return;
    }
    let constructionQueue = [];
    // Vérifie que la population est suffisante
    const minPopulation = specialization? (building.minPopulation / 3) : building.minPopulation;
    const hasEnoughPopulation = village.workers.length >= ( minPopulation || 0 );
    if (!hasEnoughPopulation) {
        // console.warn(`${this.name} n'a pas assez de population pour construire ${building.type}.`);
        return;
    }

    const existingBuilding = village.amenagements.find(a => a.type === building.type && a?.id === building?.id);
    if (existingBuilding) {

        const isMaxLevel = existingBuilding.level >= 3;
        const hasInsufficientPopulation = village.workers.length < (existingBuilding.level / 0.25) + minPopulation;
        if (isMaxLevel || hasInsufficientPopulation ) return;

        const updatedCost = existingBuilding.calculateCostForNextLevel();
        if (!specialization) {
            building.cost = updatedCost;
        }
    }
    if (village.canAffordBuilding(building)) {
        // Consomme les resources nécessaires
        const cost = (building.type === "dockyard" && allDockyards.length < 2) ? { wood: 15, stone: 5 } : building.cost;
        Object.entries(cost).forEach(([resource, quantity]) => {
            warehouse.pickFromStorage(resource, quantity);
        });
        if (specialization) village.removeFromSpecializationBuildings(building.type);
        constructionQueue.push({ ...building, priority, orderPlaced: false });
    } else {
        // Vérifie si des commandes ont déjà été passées pour ce bâtiment
        if (!village.constructionQueue.some(q => q.type === building.type && q.orderPlaced)) {
            // Planification d'achat de resources manquantes
            Object.entries(building.cost).forEach(([resource, quantity]) => {
                const availableStock = village.getStock(resource) || 0; // Stock disponible ou 0
                const neededQty = Math.max(0, quantity - availableStock); // Besoin réel

                const supplyNeeds = village.otherSupplyNeeds;
                const existingNeed = supplyNeeds.find(need => need.type === resource);

                if (!supplyNeeds) return;

                supplyNeeds.push({
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    type: resource,
                    quantity: neededQty,
                    priority: "high",
                });
            });
        }
    }
    // Priorise les bâtiments selon les besoins urgents
    if (constructionQueue.length > 0) {
        // Tri par priorité (high > medium > low)
        constructionQueue = constructionQueue.sort((a, b) => {
            const priorities = { high: 1, medium: 2, low: 3 };
            return priorities[a.priority] - priorities[b.priority];
        });
        village.constructionQueue.push(...constructionQueue);
    }
}
function getFoodCombination(){
    const combinations = [
        { ingredients: { banana: 2, cereals: 2, meat: 1 }, result: { type: "food", quantity: 6 }},
        { ingredients: { banana: 2, cereals: 2, fish: 1 }, result: { type: "food", quantity: 5 }}, 
        { ingredients: { cereals: 3, fish: 2 }, result: { type: "food", quantity: 5 }}, 
        {ingredients: { banana: 3, fish: 2 }, result: { type: "food", quantity: 5 }},
        { ingredients: { cereals: 3, meat: 1 }, result: { type: "food", quantity: 4 }},
        { ingredients: { banana: 3, meat: 1 }, result: { type: "food", quantity: 4 }},
        { ingredients: { banana: 2, cereals: 2 }, result: { type: "food", quantity: 4 }},
        { ingredients: { banana: 2, orchards: 1, fish: 1 }, result: { type: "food", quantity: 4 }},
        { ingredients: { cereals: 2, orchards: 1, fish: 1 }, result: { type: "food", quantity: 4 }},
        { ingredients: { banana: 2, orchards: 1, meat: 1 }, result: { type: "food", quantity: 4 }},
        { ingredients: { cereals: 2, orchards: 1, meat: 1 }, result: { type: "food", quantity: 4 }},
        { ingredients: { cereals: 2, meat: 1 }, result: { type: "food", quantity: 3 }},
        { ingredients: { banana: 2, meat: 1 }, result: { type: "food", quantity: 3 }}, 
        { ingredients: { cereals: 2, orchards: 1 }, result: { type: "food", quantity: 3 }},
        { ingredients: { banana: 2, orchards: 1 }, result: { type: "food", quantity: 3 }},
        { ingredients: { banana: 1, meat: 1 }, result: { type: "food", quantity: 2 }},
        { ingredients: { banana: 1, fish: 1 }, result: { type: "food", quantity: 2 }},
        { ingredients: { banana: 1, orchards: 1 }, result: { type: "food", quantity: 2 }},
        { ingredients: { cereals: 1, meat: 1 }, result: { type: "food", quantity: 2 }},
        { ingredients: { cereals: 1, fish: 1 }, result: { type: "food", quantity: 2 }},
        { ingredients: { cereals: 1, orchards: 1 }, result: { type: "food", quantity: 2 }},
        { ingredients: { banana: 1}, result: { type: "food", quantity: 1 }},
        { ingredients: { cereals: 1}, result: { type: "food", quantity: 1 }},
        { ingredients: { meat: 1}, result: { type: "food", quantity: 1 }},
        { ingredients: { fish: 1}, result: { type: "food", quantity: 1 }},
        { ingredients: { orchards: 1}, result: { type: "food", quantity: 1 }},

    ];
    return combinations;
}
function getSpecializationVillages(){
    const specializationVillages = {

        "Agri_food":[ 
            { resources: { cereals:1, meat:1 }, buildings:["mill","granary","farm","livestock_ranches"] },
            { resources: { cereals:1, fish:1 }, buildings:["mill","granary","farm","fishing_hut"] },
            { resources: { banana:1, orchards:1 }, buildings:["granary","farm"] },
            { resources: { cereals:2 }, buildings:["mill","granary","farm"] },
            { resources: { banana:2 }, buildings:["granary","farm"] } ],

        "luxury_manufacturing":[ { resources: { gold:1 }, buildings:["jewelry_workshop", "mine"] },
            { resources: { silver:1 }, buildings:["jewelry_workshop", "mine"] },
            { resources: { gems_purple:1 }, buildings:["jewelry_workshop", "mine"] },
            { resources: { gems_green:1 }, buildings:["jewelry_workshop", "mine"] },
            { resources: { gems_blue:1 }, buildings:["jewelry_workshop", "mine"] },
            { resources: { sugar_cane:1 }, buildings:["brewery", "farm"] },
            { resources: { vine:1 }, buildings:["brewery", "farm"] },
            { resources: { tobacco:1 }, buildings:["tobacco_workshop", "farm"] },
            { resources: { coffee:1 }, buildings:["coffee_workshop", "farm"] },
            { resources: { cacao:1 }, buildings:["cacao_workshop", "farm"] } 
        ],
        /* "luxury_manufacturing":[ 
            { resources: { gold:1 }, buildings:["jewelry_workshop", "gold_smelter", "mine"] },
            { resources: { silver:1 }, buildings:["jewelry_workshop", "silver_refinery", "mine"] },
            { resources: { gems_purple:1 }, buildings:["jewelry_workshop", "lapidary", "mine"] },
            { resources: { sugar_cane:1 }, buildings:["brewery", "farm"] },
            { resources: { tobacco:1 }, buildings:["tobacco_workshop", "drying_rack", "farm"] }
        ] */

        "manufacturing":[
            { resources:{ cotton:1, wool:1 }, buildings:["textile_mill","clothing_workshop","warehouse"] },
            { resources: { cotton:1 }, buildings:["textile_mill","warehouse","farm"] },
            { resources: { wool:1 }, buildings:["clothing_workshop","warehouse","sheep_ranches"] },
            { resources: { wood:2 }, buildings:["lumber_mill","warehouse"] }
        ],
        "industrial":[
            { resources: { cooper:1, coal:1 }, buildings:["forge", "mine", "warehouse"] },
            { resources: { cooper:1, wood:1 }, buildings:["forge", "mine", "warehouse"] },
            { resources: { iron:1, wood:1 }, buildings:["forge", "mine", "warehouse"] },
            // { resources: { iron:1, coal:1 }, buildings:["steel_mill", "mine", "warehouse"] },
            // { resources: { cooper:1, wood:2 }, buildings:["charcoal_kiln", "forge", "warehouse"] }
        ],
        "shipyard":[
            { resources: { wood:2, iron:1 }, buildings:["forge", "lumber_mill", "dockyard", "shipyard", "warehouse"] },
            { resources: { wood:2, cotton:1 }, buildings:["lumber_mill", "textile_mill", "dockyard", "shipyard", "warehouse"] },
            { resources: { iron:1, cotton:1 }, buildings:["dockyard", "shipyard", "warehouse"] }
        ]
    }
    return specializationVillages;
}
function shipyardGetAvailableModels(shipyardLevel, market, shipType = false){
    shipyardLevel = 3;
    const typeOfShips = {
        // Tartane (bateau), Chatte (bateau)
        fishing_boat: [
            { model: "trawler", type: "fishing", cost: { lumber: 30, fabric: 15, iron: 5, tools: 5 }, price: 2000, constructionTime: 180, capacity: 150, speed: 1.0, defense: 1, attac: 0, minLevel: 1 }
        ],
        cargo_ships: [
            { model: "chatte", type: "cargo", cost: { lumber: 60, fabric: 40, iron: 15, tools: 10 }, price: 5000, constructionTime: 240, capacity: 300, speed: 1.0, defense: 2, attac: 1, minLevel: 1 },
            { model: "caravels", type: "cargo", cost: { lumber: 75, fabric: 55, iron: 30, tools: 20 }, price: 7000, constructionTime: 300, capacity: 400, speed: 0.9, defense: 4, attac: 1, minLevel: 1 },
            { model: "galleons", type: "cargo", cost: { lumber: 150, fabric: 60, iron: 30, tools: 30 }, price: 12000, constructionTime: 360, capacity: 600, speed: 1.3, defense: 10, attac: 1, minLevel: 2 },
            { model: "clippers", type: "cargo", cost: { lumber: 100, fabric: 150, iron: 65, tools: 60 }, price: 18000, constructionTime: 300, capacity: 400, speed: 0.6, defense: 6, attac: 1, minLevel: 2 }
        ],
        warships: [
            { model: "frigate", type: "warship", cost: { lumber: 60, fabric: 50, iron: 30, coal: 10, tools: 20 }, price: 9000, constructionTime: 240, capacity: 150, speed: 1.0, defense: 12, attac: 18, minLevel: 2 },
            { model: "privateer", type: "warship", cost: { lumber: 60, fabric: 60, iron: 30, coal: 30, tools: 20 }, price: 10000, constructionTime: 300, capacity: 150, speed: 0.8, defense: 12, attac: 20, minLevel: 2 },
            { model: "line_ship", type: "warship", cost: { lumber: 150, fabric: 125, iron: 40, coal: 60, tools: 40 }, price: 20000, constructionTime: 420, capacity: 200, speed: 1.3, defense: 20, attac: 30, minLevel: 3 }
        ]
    }

    const shipsAvailable = getShipOptions(typeOfShips, market).filter(ship => ship.minLevel <= shipyardLevel);

    return shipType ? shipsAvailable.filter(ship => ship.type === shipType) : shipsAvailable;
}
function calculatePrice(resourceCost, market) {
    const basePrice = Object.entries(resourceCost).reduce((sum, [resource, amount]) => {
        return sum + (amount * market? market.getPrice(resource): determinePrice(resource));
    }, 0);
    return basePrice * 2; // Multiplication par 2 pour la marge
}
function getShipOptions(typeOfShips, market) {
    return Object.values(typeOfShips).flatMap(ships => 
        ships.map(ship => {
            return { ...ship, price: calculatePrice(ship.cost, market) }; // Cloner l'objet pour éviter les mutations
        })
    );
}
function isFarEnough(newX, newY, existingVillages, minDistance = 2) {
    return !existingVillages.some(village => 
        Math.abs(village.villagePos.x - newX) <= minDistance &&
        Math.abs(village.villagePos.y - newY) <= minDistance
    );
}
function displayVillagePopulation(villageId, totalHabitant){
    let html = `<i class="fa fa-male" aria-hidden="true"></i> ${totalHabitant}`;
    $(`.village-${villageId} #village-info-population`).empty().append(html);
}
function displayVillageAmenagements(villageId, totalAmenagements){
    let html = `<i class="far fa-building" aria-hidden="true"></i> ${totalAmenagements}`;
    $(`.village-${villageId} #village-info-building`).empty().append(html);
}
function displayVillageHappiness(villageId, happiness){
    $(`.village-${villageId} #village-info-happiness`).empty().append(formatHappiness(happiness));
}
function displayVillageGold(villageId, totalGold){
    let html = `<span class="gourdes"></span><span>${shortNumberFormat(totalGold)}</span><span class="info-text"> ${totalGold} Pièces</span>`;
    $(`.village-${villageId} #village-info-gold`).empty().append(html);
}
function updateWarehouseResources(villageId, stockId, quantity){
    $(`.village-${villageId} #townhall-view-warehouse #${stockId} .stock-num`).empty().text(Math.floor(quantity));
}
function newWarehouseResources(villageId, stockId, stockType, stockQuantity){
    let html = `<div id="${stockId}" class="stock stock-${stockType} resource icon-${stockType}"><span class="stock-num">${Math.floor(stockQuantity)}</span><span class="info-text">${ressourceFrName(stockType)||""}</span></div>`;
    $(`.village-${villageId} #townhall-view-warehouse`).append(html);
}
function formatHappiness(happiness){
    const html = happiness  > 75 ? `<i class="far fa-grin-beam" aria-hidden="true"></i>` :
    happiness  > 65 ? `<i class="far fa-smile-beam" aria-hidden="true"></i>`:
    happiness  > 50 ? `<i class="far fa-meh" aria-hidden="true"></i>`:
    happiness  > 40 ? `<i class="far fa-frown" aria-hidden="true"></i>`:
    `<i class="far fa-angry" aria-hidden="true"></i>`;
    return html;
}
function formatworkersConsumptions(consumption){
    let html = ``;
    Object.entries(consumption).forEach(([name, value]) => {
        html += `<div class="conso conso-${name}">x${value}<span class="info-text">${ressourceFrName(name)||""}</span></div>`;
    });
    return html;
}
function resizeName(){
    const nameWidth = parseInt($("#village-name").css("width"));
    $("#village-name-banner").css({
        backgroundSize: `${nameWidth + 100}px 30px`,
        width: `${nameWidth + 100}px`
    });
}
function shortNumberFormat(number){
    if (number > 99999999) {
        return number.toString().substring(0, 3)+"M"
    }else if (number > 9999999) {
        return number.toString().substring(0, 2)+"M"
    }else if (number > 999999) {
        return number.toString().substring(0, 1)+"M"
    }else if (number > 99999) {
        return number.toString().substring(0, 3)+"K"
    }else if (number > 9999) {
        return number.toString().substring(0, 2)+"K"
    }
    return number;
}
function formatTimeRemaining(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
}
function amenagementIcon(amenagement){
    const amenagements = {
        mine : `<span class=''>&#9935;</span>`,
        fishing_hut : `<i class='fas fa-fish'></i>`, 
        lumberjack_hut : `<i class='fas fa-tree'></i>`, 
        livestock_ranches : `<span class=''>&#128004;</span>`, 
        sheep_ranches : `<span class=''>&#128017;</span>`, 
        quarry : `<i class='fas fa-hammer'></i>`,
        farm : `<i class='fas fa-seedling'></i>`,
        market : `<i class='fas fa-comments-dollar'></i>`,
        port: `<i class='fas fa-anchor'></i>`,

        townhall: `<i class='fas fa-university'></i>`,
        granary: `<i class='tag-icon tag-rg-icon-granary'>&#xe800;</i>`,
        mill: `<i class='tag-icon tag-rg-icon-moulin_a_vent'>&#xe801;</i>`, //<span class='mill-emo mill-ico'>𒈔</span>
        warehouse: `<i class='tag-icon tag-rg-icon-warehouse'>&#xe802;</i>`,
        barracks: `<i class='tag-icon tag-rg-icon-barracks'>&#xe803;</i>`,
        watchtower: `<i class='tag-icon tag-rg-icon-watchtower'>&#xe804;</i>`,
        armory: `<i class='tag-icon tag-rg-icon-armory'>&#xe805;</i>`,
        dockyard: `<i class='tag-icon tag-rg-icon-dockyard'>&#xe807;</i>`,
        shipyard: `<i class='tag-icon tag-rg-icon-shipyard'>&#xe808;</i>`,
        forge: `<i class='tag-icon tag-rg-icon-forge'>&#xe809;</i>`,

        textile_mill: `<i class='tag-icon tag-rg-icon-textile_mill'>&#xe80a;</i>`,
        lumber_mill: `<i class='tag-icon tag-rg-icon-lumber_mill'>&#xe80c;</i>`, //&#xe80b;
        clothing_workshop: `<i class='tag-icon tag-rg-icon-clothing_workshop'>&#xe80d;</i>`,
        brewery: `<i class='tag-icon tag-rg-icon-brewery'>&#xe80e;</i>`,
        coffee_workshop: `<i class='tag-icon tag-rg-icon-coffee_workshop'>&#xe80f;</i>`,
        cacao_workshop: `<i class='tag-icon tag-rg-icon-cacao_workshop'>&#xe810;</i>`,
        tobacco_workshop: `<i class='tag-icon tag-rg-icon-tobacco_workshop'>&#xe811;</i>`,
        jewelry_workshop: `<i class='tag-icon tag-rg-icon-jewelry_workshop'>&#xe812;</i>`,
        theater: `<i class='tag-icon tag-rg-icon-theater'>&#xe813;</i>`,
        perfume_workshop: `<i class='tag-icon tag-rg-icon-perfume_workshop'>&#xe814;</i>`,
    }
    return amenagements[amenagement] || false;
}
function amenagementFrName(amenagement){
    const amenagements = {
        townhall: `Hôtel de ville`,
        mine : `Mine`,
        fishing_hut : `Cabane de pêche`, 
        lumberjack_hut : `Cabane de bûcheron`, 
        livestock_ranches : `Ranchs de bétail`, 
        sheep_ranches : `Ranchs de moutons`, 
        quarry : `Carrière de pierre`,
        farm : `Plantation`, //Ferme
        market : `Marché`,
        port: `Port`,
        mill: `Moulin`,
        granary: `Grenier`,
        warehouse: `Entrepôt`,
        barracks: `Caserne`,
        watchtower: `Tour de guet`,
        armory: `Armurerie`,
        dockyard: `Quai`,
        shipyard: `Chantier naval`,
        forge: `Forge`,
        textile_mill: `Atelier textile`,
        lumber_mill: `Scierie`,
        clothing_workshop: `Atelier de vêtements`,
        brewery: `Brasserie`,
        coffee_workshop: `Atelier de café`,
        cacao_workshop: `Atelier de cacao`,
        tobacco_workshop: `Atelier de tabac`,
        jewelry_workshop: `Atelier de bijoux`,
        perfume_workshop: `Atelier de parfum`,
        theater: `Théâtre`,
    }
    return amenagements[amenagement] || false;
}
function ressourceFrName(resource){
    const ressourcesFr = {
        food: "Nourritures | Foods",
        gems_purple: "Saphir", //Diamant violet, Améthyste, Kunzite violette, Saphir Violet, Tanzanite violette, Spinelle violette
        gold: "Or | Gold",
        silver: "Argent | Silver",
        gems_green: "Émeraude", //Diamant vert, Saphir vert, Émeraude, Tourmaline verte, Péridot, Chrome Diopside, Tourmaline chromée, Zircon vert, Grenat Tsavorite
        gems_blue: "Topaz", //Diamant bleu, Topaz bleu, Tourmaline bleue, Cyanite, Apatite bleue, Zircon Bleu, Spinelle Bleu, Benitoïte, Lazulite,
        iron: "Fer | Iron",
        copper: "Cuivre | Copper",
        sugar_cane: "Cannes à Sucres | Sugar canes",
        vine: "Vignes | Vines",
        tobacco: "Tabacs | Tobaccos",
        coffee: "Café | Coffee",
        cacao: "Cacaos | Cocoas",
        coal: "Charbons | Coals",
        wool: "Laines | Wools",
        orchards: "Fruits | Fruits", // "Vergers | Orchards"
        meat: "Viandes | Meats",
        cotton: "Cotons | Cottons",
        banana: "Bananes | Bananas",
        cereals: "Céréales | Cereals",
        stone: "Pierres | Stones",
        wood: "Bois | Woods",
        fish: "Poissons | Fishs",

        lumber: "Bois d'oeuvre | Lumber",
        tools: "Outils | Tools",
        fabric: "Tissus | Fabrics",
        clothes: "Vêtements | Clothes",
        liquor: "Alcool | Liquor",
        cigars: "Cigares | Cigars",
        chocolate: "Chocolat | Chocolate",
        ground_coffee: "Café moulu | Fine coffee",
        jewelry: "Bijoux | Jewelry",
        rifle: "Fusil | Gun",
        artillery: "Artillerie | Artillery",
        spear: "Lance | Spear",
        shield: "Bouclier | shield",

    }
    return ressourcesFr[resource] || false;
}
function workersFrType(type){
    const workersType = {
        peasant: "Paysan | Peasant",
        workman: "Ouvrier | Worker",
        learner: "Apprenti | Learner",
        deckhand: "Mousse",
        dockhand: "Docker",
        farmer: "Fermier", 
        master_Farmer: "Agriculteur", 
        miller: "Meunier", 
        hookman: "Pêcheur à la ligne", 
        netter: "Pêcheur au filet", 
        fisherman: "Pêcheur", 
        seaman: "Marin", 
        longshoreman: "Manutentionnaire", // portuaire
        foreman: "Contremaître",
        carpenter: "Charpentier",
        master_shipwright: "Maître charpentier naval",
        miner: "Mineur", 
        lumberjack: "Bûcheron", 
        sawyer: "Scieur de long", 
        blacksmith: "Forgeron", 
        master_builder: "Maître d'œuvre", 
        maneuver: "Manœuvre", 
        rancher: "Éleveur", 
        herdsman: "Berger", 
        stonemason: "Tailleur de pierre", 
        sailor: "Matelot", 
        capitain: "Capitaine", 
        merchant: "Marchand", 
        broker: "Courtier", 
        administrator: "Administrateur", 
        weaver: "Tisserand", 
        tailor: "Tailleur", 
        brewer: "Brasseur",
        tobacconist: "Fabricant de cigares", 
        coffee_roaster: "Torréfacteur", 
        chocolatier: "Chocolatier", 
        jeweller: "Bijoutier-joaillier", 
    }
    return workersType[type];
}
function startGlobalTimer(villages, interval = 60000) {
    // Managing population growth, worker consumption, production management
    setInterval(() => {
        villages.forEach(village => {
            if (village.workers.length <= 0) return;
            const port = village.amenagements.find(building => building.type === "port");
            village.managePopulation();
            if (village.owner) return;
            port.planShipConstruction();
        });
    }, interval); 

    // Taxes management, trade Management and Plan Construction management
    setInterval(() => {
        villages.forEach(village => {
            if (village.workers.length <= 0) return;
            village.generateTaxes();

            if (village.owner) return;
            const market = village.amenagements.find(building => building.type === "market");
            market.maintainMarket();

            village.planConstruction();
            
        });
    }, 30000);
    setInterval(() => {

        villages.forEach(village => {
            if (village.workers.length <= 0) return;

            village.amenagementsProduction();
            village.workshopsProduction();
        });

    }, 15000); 

    // Construction management
    setInterval(() => {
        villages.forEach(village => {
            if (village.workers.length <= 0) return;
            village.startConstruction();
        });
    }, 5000);
}

function showMap(grid, islands, callback){
    const fragment = document.createDocumentFragment();
    islands.forEach(island => {
        let addIslandName = false;
        island.landPos.forEach((pos, i) => {
            const land = document.createElement('div');
            land.id = `cell-${pos.x}x${pos.y}`;
            land.className = `mapCase island_${island.islandID} ${pos.type}`;
            land.style.position = 'absolute';
            land.style.top = `${pos.x * cellSize}px`;
            land.style.left = `${pos.y * cellSize}px`; 
            land.dataset.islandId = island.islandID;
            if (island.resources[pos.x]?.[pos.y]) {
                island.resources[pos.x][pos.y].forEach(resource => {
                    const ressrcs = document.createElement('div');
                    ressrcs.id = `ress-${pos.x}x${pos.y}`;
                    ressrcs.className = `island-resource ${resource.type} owner-${resource?.owner?.replace("-", "x")}`;
                    ressrcs.style.position = 'absolute';
                    ressrcs.dataset.type = resource.type;
                    ressrcs.dataset.quantite = resource.quantite;
                    ressrcs.dataset.status = resource.status;
                    ressrcs.dataset.upgradeLevel = resource.upgradeLevel;
                    ressrcs.innerHTML = createResourceHTML(resource);//`<span class="ress-icon ${resource.type}-icon"></span><span class="ress-name">${resource.type}</span>`;
                    land.appendChild(ressrcs);
                });
            }
            island.villages.some(village => {
                if(village.villagePos?.x == pos.x && village.villagePos?.y == pos.y){
                    const villageDiv = document.createElement('div');
                    villageDiv.id = `village-${village.id.replace("-", "x")}`;
                    villageDiv.className = `village ${village.type}`;
                    villageDiv.style.position = 'absolute';
                    villageDiv.innerHTML = `<span class="village-name">${village.name}</span>`;
                    land.appendChild(villageDiv);
                }
            });
            fragment.appendChild(land);
        });
        island.beaches.forEach(pos => {
            const beach = document.createElement('div');
            beach.id = `cell-${pos.x}x${pos.y}`;
            beach.className = `mapCase island_${island.islandID} ${pos.type}`;
            beach.style.position = 'absolute';
            beach.style.top = `${pos.x * cellSize}px`;
            beach.style.left = `${pos.y * cellSize}px`;
            beach.dataset.islandId = island.islandID;
            if (pos.type.includes('nord') && !pos.type.includes('nord-est') && !pos.type.includes('nord-ouest')
                && !pos.type.includes('river') && !addIslandName) {
                addIslandName = true;
                beach.innerHTML = `<span class="island-name ${island.name}">${island.name}<span class="island-location">(${pos.islandID})<span/></span>`
            }
            island.villages.some(village => {
                if(village.villagePos.x == pos.x && village.villagePos.y == pos.y){
                    const villageDiv = document.createElement('div');
                    villageDiv.id = `village-${village.id.replace("-", "x")}`;
                    villageDiv.className = `village ${village.type}`;
                    villageDiv.dataset.resources = `owner-${village.id.replace("-", "x")}`;
                    villageDiv.style.position = 'absolute';
                    villageDiv.innerHTML = `<span class="village-name">${village.name}</span>`;
                    beach.appendChild(villageDiv);
                }
            });
            if (island.resources[pos.x]?.[pos.y]) {
                island.resources[pos.x][pos.y].forEach(resource => {
                    const ressrcs = document.createElement('div');
                    ressrcs.id = `ress-${pos.x}x${pos.y}`;
                    ressrcs.className = `island-resource ${resource.type} owner-${resource?.owner?.replace("-", "x")}`;
                    ressrcs.style.position = 'absolute';
                    ressrcs.dataset.type = resource.type;
                    ressrcs.dataset.owner = `owner-${resource?.owner?.replace("-", "x")}`;
                    ressrcs.dataset.status = resource.status;
                    ressrcs.dataset.upgradeLevel = resource.upgradeLevel;
                    ressrcs.innerHTML = createResourceHTML(resource); //`<span class="ress-icon ${resource.type}-icon"></span><span class="ress-name">${resource.type}</span>`;
                    beach.appendChild(ressrcs);
                });
            };
            fragment.appendChild(beach);
        });
    });
    function createResourceHTML(resource) {
        return `
            <div class="ress-info">
                <span class="ress-icon ${resource.type}-icon"></span>
                <span class="ress-name">${resource.type}</span>
            </div>
        `;
    }
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === null) {
                const ocean = document.createElement('div');
                ocean.id = `cell-${i}x${j}`;
                ocean.style.position = 'absolute';
                ocean.style.top = `${i * cellSize}px`;
                ocean.style.left = `${j * cellSize}px`;
                    ocean.className = `mapCase ocean`;
                    // ocean.innerText = `(${i}x${j})`;
                    // $("#game-box").append("<div id='"+i+"x"+j+"' class='mapCase' style='position:absolute;top:"+(i*cellSize)+"px;left:"+(j*cellSize)+"px;'>("+i+","+j+")</div>"); 
                
                fragment.appendChild(ocean);
            }
        }
    }
    document.getElementById('game-box').appendChild(fragment);
    console.log("Statistiques des resources :", getResourceStats(islands));
    // console.log(getIslandStats(islands));
    let villagesCotieres = villages.filter(v => v.type.includes("cotiere"));
    
    callback();
    // createTradeRoute(villagesCotieres);
    startGlobalTimer(villages);
}
function getTotalResourcesByIsland(island, islandID) {
    const totals = {};
    const cells = [...island.landPos, ...island.beaches];

    cells.forEach(cell => {
        if (cell.islandID === islandID) {
            const resources = island.resources[cell.x]?.[cell.y] || [];
            resources.forEach(resource => {
                totals[resource.type] = (totals[resource.type] || 0) + 1;
            });
        }
    });

    return totals;

}
function getTotalFreeResourcesByIsland(island, islandID) {
    const totals = {};
    const cells = [...island.landPos, ...island.beaches];

    cells.forEach(cell => {
        if (cell.islandID === islandID) {
            const resources = island.resources[cell.x]?.[cell.y] || [];
            resources.forEach(resource => {
                if (!resource.exploited) {
                    totals[resource.type] = (totals[resource.type] || 0) + 1;
                }
            });
        }
    });

    return totals;
}
function getTotalLandTypeByIsland(island, islandID) {
    const totals = {};
    const cells = [...island.landPos];

    cells.forEach(cell => {
        if (cell.islandID === islandID) {
            const type = cell.type;
            totals[type] = (totals[type] || 0) + 1;
        }
    });

    return totals;

}
function getIslandStats(islands) {
    return islands.map(island => {
        const totalResources = getTotalResourcesByIsland(island, island.islandID);
        const totalFreeResources = getTotalFreeResourcesByIsland(island, island.islandID);
        const totalLandType = getTotalLandTypeByIsland(island, island.islandID);
        return {
            islandID: island.islandID,
            islandName: island.name,
            land: island.landPos.length,
            beaches: island.beaches.length,
            size : island.landPos.length + island.beaches.length,
            villages: island.villages,
            totalResources,
            totalFreeResources,
            totalLandType
        };
    });
}
function getTotalResourcesOnMap(islands) {
    const totals = {};

    islands.forEach(island => {
        const cells = [...island.landPos, ...island.beaches];
        cells.forEach(cell => {
            const resources = island.resources[cell.x]?.[cell.y] || [];
            resources.forEach(resource => {
                totals[resource.type] = (totals[resource.type] || 0) + 1;
            });
        });
    });

    return totals;
}
function getResourceStats(islands) {
    const totals = getTotalResourcesOnMap(islands);
    const totalResources = Object.values(totals).reduce((sum, count) => sum + count, 0);
    const totalCells = islands.reduce((sum, island) => 
        sum + island.landPos.length + island.beaches.length, 0);

    const stats = {};
    for (const [resource, count] of Object.entries(totals)) {
        stats[resource] = {
            totals: totals[resource],
            percentage: ((count / totalResources) * 100).toFixed(2),
            average: (count / totalCells).toFixed(2)
        };
    }

    return stats;
}
function tornKingdomMap(){
    const maps = JSON.parse(localStorage.getItem("maps")) || {};
    Object.entries(torn_Kingdom_maps).filter(([key, values]) => {
        const tornKingdom = generateTornKingdomMap(values);
        const tornKingdomGrid = tornKingdom.grid;
        const tornKingdomIslands = tornKingdom.islands;
        const mapName = `${key}`;
        maps[mapName] = { grid: tornKingdomGrid, islands: tornKingdomIslands, gridSize:{x:50, y:50} };
        localStorage.setItem("maps", JSON.stringify(maps) );
    });
}
function showTabsBtn(village){
    const buildingsBtn = document.querySelector(`.village-${village.id} .buildings-btn`);
    const marketBtn = document.querySelector(`.village-${village.id} .market-btn`);
    const portBtn = document.querySelector(`.village-${village.id} .port-btn`);

    if (isBtnHidden(buildingsBtn) && villageHasBuilding(village, false, "amenagement" )) {
        buildingsBtn.style.display = 'block';
    }
    if (isBtnHidden(marketBtn) && villageHasBuilding(village, "market", false )) {
        marketBtn.style.display = 'block';
    }
    if (isBtnHidden(portBtn) && villageHasBuilding(village, "port", false )) {
        portBtn.style.display = 'block';
    }
}
function isBtnHidden(el) {
    if (el) {
        return (el.offsetParent === null);
    }
    return false;
}
function villageHasBuilding(village, buildingType = false, buildingCategory = false) {
    if (buildingType) {
        return village.amenagements.some(building => building.type === buildingType);
    }
    if (buildingCategory) {
        return village.amenagements.some(building => building.category === buildingCategory);
    }
    return false;
}