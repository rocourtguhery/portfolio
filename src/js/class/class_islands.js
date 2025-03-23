

class Island {
    constructor(name, size) {
        this.name = name;
        this.size = size;
        this.islandID;
        this.landPos = [];  // Positions des terres de l'île
        this.beaches = [];  // Positions des plages
        this.villages = []; 
        this.resources = []; 
    }
    
    // Ajout de la terre à l'île
    addLand(x, y, landType, islandID) {
        this.landPos.push({ x, y, type: landType, islandID });
        allLand.push({ x, y, type: landType, islandID });
    }

    // Ajout une plage à l'île
    addBeach(x, y, type, islandID) {
        this.beaches.push({ x, y, type, islandID });
        allBeaches.push({ x, y, type, islandID });
    }

    // Obtenir les resources d'une cellule
    getResources(x, y) {
        return this.resources[x]?.[y] || [];
    }

    // Ajout d'une resource avec vérification
    addResource(x, y, resource) {
        if (!this.resources[x]) this.resources[x] = {};
        if (!this.resources[x][y]) this.resources[x][y] = [];
        // Ajoute la resource si la cellule a moins de 3 resources
        if (this.resources[x][y].length < 3) { // && !this.resources[x][y].includes(resource)
            this.resources[x][y].push(resource);
        }
    }
    // Vérifie si une position est déjà occupée par de la terre
    isPositionOccupied(x, y) {
        return this.landPos.some(pos => pos.x === x && pos.y === y) || 
            this.beaches.some(beach => beach.x === x && beach.y === y);
    }
    // Génération de terre autour d'une position
    generateContiguousLand(centerX, centerY, gridSize, islandID) {
        const queue = [{ x: centerX, y: centerY }];
        const directions = [
            { dx: 0, dy: -1 }, // Nord
            { dx: 1, dy: 0 },  // Est
            { dx: 0, dy: 1 },  // Sud
            { dx: -1, dy: 0 },  // Ouest
            { dx: -1, dy: -1 }, // Nord-Ouest
            { dx: 1, dy: -1 },  // Nord-Est
            { dx: -1, dy: 1 },  // Sud-Ouest
            { dx: 1, dy: 1 }   // Sud-Est
        ];

        // Fonction de mélange
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        const shuffledDirections = shuffleArray([...directions]); 

        while (queue.length > 0 && this.landPos.length < this.size) {
            const { x, y } = queue.shift();
            if (
                this.isPositionOccupied(x, y) ||
                x < 2 || y < 2 || x >= gridSize.x - 4 || y >= gridSize.y - 4 // Garder une bordure pour plages
            ) {
                continue;
            }
            this.addLand(x, y, getRandomType("land"), islandID);

            shuffledDirections.forEach(({ dx, dy }) => {
                const newX = x + dx;
                const newY = y + dy;
                if (!this.isPositionOccupied(newX, newY)) {
                    queue.push({ x: newX, y: newY });
                }
            });
        }
    }

    getLandAdjacency(x, y){
        return  getDirections().filter(({ dx: ddx, dy: ddy }) => this.landPos.some(pos => pos.x === x + ddx && pos.y === y + ddy))
                        .map(cell => cell.type);
    }

    getBeachAdjacency(x, y){
        return  getDirections().filter(({ dx: ddx, dy: ddy }) => this.beaches.some(pos => pos.x === x + ddx && pos.y === y + ddy))
                        .map(cell => cell.type);
    }

    // Génération des plages
    generateBeaches(gridSize, islandID) {
        const rules = [
            { patterns: [['nord'],['nord', 'nord-est'],['nord', 'nord-ouest'],['nord', 'nord-ouest', 'nord-est']], type: `beach-${getRandomType("beach")} sud` },
            { patterns: [['sud'],['sud', 'sud-est'],['sud', 'sud-ouest'],['sud', 'sud-ouest', 'sud-est']], type: `beach-${getRandomType("beach")} nord` },
            { patterns: [['est'],['est', 'nord-est'],['est', 'sud-est'],['est', 'nord-est', 'sud-est']], type: `beach-${getRandomType("beach")} ouest` },
            { patterns: [['ouest'],['ouest', 'sud-ouest'],['ouest', 'nord-ouest'],['ouest', 'nord-ouest', 'sud-ouest']], type: `beach-${getRandomType("beach")} est` },
            { patterns: [['sud-est']], type: `corner-out-${getRandomType("corner")} nord-ouest` },
            { patterns: [['sud-ouest']], type: `corner-out-${getRandomType("corner")} nord-est` },
            { patterns: [['nord-est']], type: `corner-out-${getRandomType("corner")} sud-ouest` },
            { patterns: [['nord-ouest']], type: `corner-out-${getRandomType("corner")} sud-est` },
            { patterns: [['sud','est'], ['sud', 'est', 'sud-est'], ['sud', 'est', 'sud-ouest'], ['sud', 'est', 'nord-ouest']
                        ,['sud', 'est', 'nord-est'], ['sud','est','sud-ouest','sud-est'], ['sud', 'est', 'nord-est', 'sud-est'], ['sud', 'est', 'nord-est', 'sud-ouest'],['sud', 'est', 'nord-est','sud-est']], type: `corner-in-${getRandomType("corner")} nord-ouest` },
            { patterns: [['sud','ouest'], ['sud', 'ouest', 'sud-ouest'], ['sud', 'ouest', 'nord-ouest'], ['sud', 'ouest', 'sud-est']
                        ,['sud', 'ouest', 'nord-ouest', 'sud-ouest'], ['sud', 'ouest', 'sud-est', 'sud-ouest'], ['sud', 'ouest', 'sud-ouest', 'sud-est'], ['sud', 'ouest', 'nord-ouest', 'sud-est']], type: `corner-in-${getRandomType("corner")} nord-est` },
            { patterns: [['nord','est'], ['nord', 'est', 'nord-est'], ['nord', 'est', 'sud-est'], ['nord', 'est', 'nord-ouest']
                        ,['nord', 'est', 'nord-est', 'sud-est'], ['nord', 'est', 'nord-est', 'nord-ouest'], ['nord', 'est', 'nord-ouest', 'nord-est'], ['nord', 'est', 'nord-ouest', 'nord-est']], type: `corner-in-${getRandomType("corner")} sud-ouest` },
            { patterns: [['nord','ouest'], ['nord', 'ouest', 'nord-ouest'],['nord', 'ouest', 'sud-ouest'], ['nord', 'est', 'sud-est'] ,['nord', 'ouest', 'nord-est']
                        ,['nord', 'ouest', 'nord-ouest', 'sud-ouest'], ['nord', 'ouest', 'nord-ouest', 'nord-est'], ['nord', 'ouest', 'nord-ouest', 'nord-est','sud-ouest'],['nord', 'ouest', 'nord-ouest','sud-ouest']], type: `corner-in-${getRandomType("corner")} sud-est` },
            { patterns: [['sud', 'est', 'ouest'], ['sud', 'est', 'ouest', 'sud-ouest'], ['sud', 'est', 'ouest','sud-est'], ['sud', 'est', 'ouest', 'sud-ouest','sud-est']], type:  `river-${getRandomType("river")} nord` },
            { patterns: [['nord', 'est', 'ouest'], ['nord', 'est', 'ouest', 'nord-ouest'], ['nord', 'est', 'ouest','nord-est'], ['nord', 'est', 'ouest', 'nord-ouest','nord-est']], type:  `river-${getRandomType("river")} sud` },
            { patterns: [['nord', 'sud', 'ouest'], ['nord', 'sud', 'ouest', 'nord-ouest'], ['nord', 'sud', 'ouest', 'nord-ouest', 'sud-ouest'], ['nord', 'sud', 'ouest', 'sud-ouest']], type:  `river-${getRandomType("river")} est` },
            { patterns: [['nord', 'sud', 'est'], ['nord', 'sud', 'est', 'nord-est'], ['nord', 'sud', 'est', 'nord-est','sud-est'], ['nord', 'sud', 'est', 'sud-est']], type:   `river-${getRandomType("river")} ouest` },
            { patterns: [['sud-ouest','sud-est']], type: `embouchure-${getRandomType("embouchure")} nord` },
            { patterns: [['nord-ouest', 'nord-est']], type: `embouchure-${getRandomType("embouchure")} sud` },
            { patterns: [['nord-ouest', 'sud-ouest']], type: `embouchure-${getRandomType("embouchure")} est` },
            { patterns: [['nord-est', 'sud-est']], type: `embouchure-${getRandomType("embouchure")} ouest` },
        ];

        this.landPos.forEach(({ x, y }) => {
            getDirections().forEach(({ dx, dy, type }) => {
                const beachX = x + dx;
                const beachY = y + dy;
                
                if (
                    beachX >= 0 && beachY >= 0 &&
                    beachX < gridSize.x && beachY < gridSize.y &&
                    !this.isPositionOccupied(beachX, beachY)
                ) {
                    const adjacent = this.getLandAdjacency(beachX, beachY);

                    // Détermine le type de plage
                    let beachType = `plain ${type}`; // Par défaut
                    for (let rule of rules) {
                        if (matchesPattern(adjacent, rule.patterns)) {
                            beachType = rule.type;
                            break;
                        }
                    }
                    
                    this.addBeach(beachX, beachY, beachType, islandID);
                }
            });
        });
    }
    getAllowedResources(){
        const allowedResources = {
            "plain": ["wood", "stone", "sugar_cane", "vine", "orchards", "tobacco", "coffee", "cacao", "banana", "cotton", "meat", "cereals"],
            "hill": ["wool", "copper", "coal"],
            "mountain": ["gold", "silver", "iron"],
            "desert": ["gems_purple", "gems_green", "gems_blue"],
            "oasis": ["gems_purple", "gems_green", "gems_blue"],
            'corner-out-1': ['fish'],
            'corner-out-2': ['fish'],
            'corner-out-3': ['fish',"wool", "meat", "sugar_cane", "wood"],
            'corner-in-1': ['fish',"stone", "wood", "meat"],
            'corner-in-2': ['fish'],
            'corner-in-3': ['fish',"stone", "wood", "meat", "wood"],
            'beach-1': ["stone", "wood", "meat",],
            'beach-2': ["stone", "wood", "meat",],
            'beach-3': ['fish'],
            'beach-4': ['fish'],
            'river-1': ['fish', 'gold', 'stone','gems_blue','gems_green', "wood"],
            'river-2': ['fish', 'gold', 'stone','gems_blue','gems_green', "wood"],
            'river-3': ['fish', 'stone','gems_blue','gems_green', "wood"],
            'river-4': ['fish','gems_purple','gems_green'],
            'embouchure-1': ['fish', 'gold', 'stone','gems_blue', "wood"],
            'embouchure-2': ['fish', 'gold', 'stone','gems_blue', "wood"],
            'embouchure-3': ['fish', 'gold', 'stone','gems_blue', "wood"],
        };
        return allowedResources;
    }

    distributeResources(x, y, type, resourceRarity, islandID) {

        let terrainType = type.includes('plain') || 
                            type.includes('hill') ||
                            type.includes('mountain') ||
                            type.includes('desert') ||
                            type.includes('oasis') ? type : type.split(" ")[0];

        let place = type.split("-")[0];
        
        const numResources = place.includes('corner') || 
                            place.includes('beach') ||
                            place.includes('river') ||
                            place.includes('embouchure') ? Math.floor(Math.random()* 2) : 
                            place.includes('hill') || 
                            place.includes('mountain') ? Math.floor(Math.random() * 3) : 
                            place.includes('desert') ||
                            place.includes('oasis') ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4);
        
        let allowedResources = this.getAllowedResources();

        if (place.includes('corner') || place.includes('beach') && this.isNearOtherIslandBeach(x, y, 4)) return; // Évite d'ajouter des poissons près des côtes voisines
        
        const resourcesForType = allowedResources[terrainType] || [];
        if (!resourcesForType.length) return;

        const filteredRarity = Object.fromEntries(
            Object.entries(resourceRarity).filter(([resource]) => allowedResources[terrainType]?.includes(resource))
        );

        // Raretés dynamiquement
        const adjustedRarity = calculateAdjustedRarity(x, y, terrainType, filteredRarity);

        for (let i = 0; i < numResources; i++) {
            const resource = Island.getRandomResource(filteredRarity);
            if (resource) {
                const resourcesCategories = luxuryResources.includes(resource) ? "luxury" :
                                            strategicResources.includes(resource) ? "strategic" :
                                            agriFoodResources.includes(resource) ? "agriFood" : "none";

                this.addResource(x, y, {
                    id: `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                    islandID: islandID,
                    type: resource,
                    buildingType:  amenagementForResource(resource),
                    status: resourcesUnavailable.includes(resource) ? "unavailable" : "available",
                    category : resourcesCategories,
                    owner: null,
                    upgradeLevel: resourcesUnavailable.includes(resource)? 0 : 1,
                    discovered: false,
                    exploited: false
                });
            }
        }
    }
    static getRandomResource(rarity) {
        const totalWeight = Object.values(rarity).reduce((sum, weight) => sum + weight, 0);
        let randomValue = Math.random() * totalWeight;

        for (const [resource, weight] of Object.entries(rarity)) {
            if (randomValue < weight) {
                return resource;
            };
            randomValue -= weight;
        }
    }

    isNearOtherIslandBeach(x, y, maxDistance){
        const currentBeach = this.beaches.find(beach => beach.x === x && beach.y === y);
        if (!currentBeach) return false;

        return this.beaches.some(beach => {
            if (beach.islandID === currentBeach.islandID) return false; // Même île, on ignore
            const distance = Math.sqrt(Math.pow(beach.x - x, 4) + Math.pow(beach.y - y, 4));
            return distance < maxDistance; 
        });
    }

}