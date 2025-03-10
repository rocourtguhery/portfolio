class Villages {
    constructor(name, x, y, villageType, villageLevel, villageID, islandID, orientation) {
        this.islandID = islandID;
        this.id = villageID;
        this.name = name;
        this.villagePos = { x, y };
        this.orientation = orientation;
        this.type = villageType; // Capitale, cotiere, interieur
        this.level = villageLevel; 
        this.resources = []; // resources accessibles
        this.amenagements = []; // Bâtiments
        this.workers = []; // Population
        this.owner = null;
        this.houses = 1; // Logement
        this.housingCapacity = 5; // Capacité des logements
        this.agriFoodNeeds = [];
        this.otherSupplyNeeds = [];
        this.tradeRoutes = [];
        this.gold = 10000; // Monnaie pour commercer
        this.baseTaxRate = 0.2; // impots, taxes...
        this.merchants = []; // Liste des marchands
        this.ships = []; // Liste des navires
        this.underConstruction = false;
        this.houseUnderConstruction = false;
        this.constructionQueue = []; // File d'attente des projets de construction
        this.constructionSite = []; // Bâtiments en chantier
        this.specializationBuildings = []; // Liste des bâtiments à construire par les villages spécialisés
        this.category = null; // Catégorie de spécialisation
        this.specializationCompleted = true;

    }
    assignNearbyResources(island, maxResources = 4) {
        const resourcesNearby = getNearbyResources(this.villagePos, island);
        let availableResources = resourcesNearby.filter(resource => !resource.exploited);
        const assignedResources = availableResources.slice(0, maxResources);
        assignedResources.forEach(resource => {
            resource.exploited = !this.owner ? true : false; // Marque comme exploitée
            resource.owner = this.id;
            resource.discovered = (this.owner && !resourcesUnavailable.includes(resource.type)) ? true :
                    !this.owner ? true : false;
            if (resource.type === "cereals" ) {
                this.resources.unshift(resource);
            }else{
                this.resources.push(resource);
            }
        });
        this.determineSpecialization();
        this.buildAmenagement();
    }
    buildAmenagement() {
        const newBuildingData = {
            villageID: this.id,
            villagePos: this.villagePos,
            level: 1,
            islandID: this.islandID,
        }
        // const baseBuildings = ["townhall","warehouse", "port", "market"];
        const baseBuildings = ["townhall","warehouse"];
        if (!this.owner) {
            baseBuildings.push( "market", "port");
        }
        baseBuildings.forEach(building => {
            newBuildingData.type = building;
            newBuildingData.category = "infrastructure";
            newBuildingData.cost = getBuildingInfo(building, "cost");
            newBuildingData.constructionTime = getBuildingInfo(building, "constructionTime");
            newBuildingData.minPopulation = getBuildingInfo(building, "minPopulation");
            newBuildingData.resource = null;
            this.build(newBuildingData);
        });
        this.resources.forEach(resource => {
            if (!this.owner) {
                const amenagement = amenagementForResource(resource.type);
                if (amenagement) {
                    newBuildingData.type = amenagement;
                    newBuildingData.category = "amenagement";
                    newBuildingData.cost = getBuildingInfo(amenagement, "cost");
                    newBuildingData.constructionTime = getBuildingInfo(amenagement, "constructionTime");
                    newBuildingData.minPopulation = getBuildingInfo(amenagement, "minPopulation");
                    newBuildingData.resource = resource;
                    newBuildingData.resourceId = resource.id;
                    this.build(newBuildingData);
                }
            }
        });
    }
    build(newBuildingData){
        const buildingType = newBuildingData.type;
        switch (buildingType) {
            case "warehouse":
                const newWarehouses = new Warehouses(newBuildingData);
                this.amenagements.push(newWarehouses);
                buildings.push(newWarehouses);
                newWarehouses.addToStock("food", 100);
                newWarehouses.addToStock("cereals", 100);
                newWarehouses.addToStock("wood", 100);
                newWarehouses.addToStock("stone",  100);
                newWarehouses.addToStock("iron",  !this.owner? 50 : 100);
                newWarehouses.addToStock("tools",  !this.owner? 100 : 50);
                
                if (this.owner) {
                    this.peasantPopUp(newWarehouses);
                    this.peasantPopUp(newWarehouses);
                }

                break;

            case "market":
                const market = new Markets (newBuildingData);
                this.amenagements.push(market);
                buildings.push(market);
                allMarkets.push(market);
                market.calculateMaxLabors();
                if (!this.owner) {
                    market.generateWorkers();
                }
                break;

            case "port":
                const port = new Ports(newBuildingData);
                this.amenagements.push(port);
                buildings.push(port);
                allPorts.push(port);
                port.calculateMaxLabors();
                port.addShip();
                port.addShip();
                if (!this.owner) {
                    port.generateWorkers();
                }
                break;

            case "dockyard":
                const dockyard = new Dockyards(newBuildingData);
                this.amenagements.push(dockyard);
                buildings.push(dockyard);
                allDockyards.push(dockyard);
                dockyard.calculateMaxLabors();
                if (!this.owner) {
                    dockyard.generateWorkers();
                }
                break;

            case "shipyard":
                const shipyard = new Shipyards(newBuildingData);
                this.amenagements.push(shipyard);
                buildings.push(shipyard);
                shipyard.calculateMaxLabors();
                if (!this.owner) {
                    shipyard.generateWorkers();
                }
                break;

            case "granary":
                const granary = new Granaries(newBuildingData);
                this.amenagements.push(granary);
                buildings.push(granary);
                const warehouse = this.amenagements.find(a => a.type === "warehouse");
                let foodStock = warehouse.stock?.find(item => item.type === "food");
                granary.addToStock(foodStock.type, foodStock.quantity);
                foodStock.quantity = 0;
                break;
        
            default:
                const building = new Buildings(newBuildingData);
                this.amenagements.push(building);
                buildings.push(building);
                if (!this.owner) {
                    building.generateWorkers();
                }else {
                    if (building.category === "amenagement" || building.category === "workshop") {
                        amenagementsBuilding(building);
                    }
                }
                break;
        }
    }
    determineSpecialization() {
        const specializationRules = getSpecializationVillages();
        let category = "general";
        let buildings = [];

        Object.entries(specializationRules).forEach(([key, specializations]) => {
            specializations.forEach(rule => {
                const matchingResources = Object.entries(rule.resources).every(([type, quantity]) => {
                    // Calcule combien de resources de chaque type disponibles 
                    const resourceCount = this.resources.filter(resource => resource.type === type).length;
                    return resourceCount >= quantity;// Vérification des ressources requise
                });

                if (matchingResources) {
                    category = key;
                    buildings = rule.buildings;
                }
            });
        });

        this.category = category;
        this.specializationBuildings = buildings;
        this.specializationCompleted = (this.category === "general") || 
                                        buildings.every(building => this.amenagements.some(amg => amg.type === building));
        
        return category;
    }
    amenagementsProduction(){
        const resourceProductionBuilding = this.amenagements.filter( building => building.category === "amenagement" );
        resourceProductionBuilding.forEach(building => {
            building.calculateProduction("amenagement");
        });
        this.produceFood();
    }
    workshopsProduction(){
        const resourceProductionBuilding = this.amenagements.filter( building => building.category === "workshop" );
        resourceProductionBuilding.forEach(building => {
            building.calculateProduction("workshop");
        });
    }
    produceFood(){
        const warehouse = this.amenagements.find(a => a.type === "warehouse");
        const depotCapacity = warehouse.capacity;
        const depotStock = warehouse.stock.reduce((sum, item) => sum + item.quantity, 0);
        if (depotStock >= depotCapacity || !warehouse.canProductFood()) return;
        // const stock = this.stock;
        const combinations = getFoodCombination();

        const mill = this.amenagements.find(a => a.type === "mill");
        const granary = this.amenagements.find(a => a.type === "granary");

        const millMultiplier = mill ? 1.25 : 1.0; // 25% bonus si un moulin est présent
        const granaryMultiplier = granary ? 1.15 : 1.0; // 15% bonus si un granary est présent
        const combinedMultiplier = mill && granary ? 1.35 : 1.0; // Bonus combiné si les deux sont présents

        const workersLaborforce = this.workers.reduce((total, worker) => total + worker.laborforce, 0);
        const finalMultiplier = millMultiplier * granaryMultiplier * combinedMultiplier * workersLaborforce;

        for (const combo of combinations) {
            const canProduce = Object.entries(combo.ingredients).every(([type, quantity]) => {

                const item = warehouse.pickFromStorage(type, quantity, "check");
                return item;
            });
            if (canProduce) {
                Object.entries(combo.ingredients).forEach(([type, quantity]) => {
                    warehouse.pickFromStorage(type, quantity)
                });
                const foodQty = Math.ceil(combo.result.quantity * finalMultiplier);
                if (granary && granary.allowedResources.includes(combo.result.type)) {
                    granary.addToStock(combo.result.type, foodQty);
                } else {
                    warehouse.addToStock(combo.result.type, foodQty);
                }
                break;
            }
        }
        this.evaluateAgriFoodNeeds(combinations, warehouse);         
    }
    evaluateAgriFoodNeeds(combinations, warehouse) {
        if (this.owner) return;
        const needs = this.agriFoodNeeds;
        const population = this.workers.length;
        const dailyFoodNeed = this.workers.reduce((sum, worker) => {
            return sum + worker.consumption.food
        }, 0);

        // Vérification des besoins alimentaires
        const foodStock = warehouse.pickFromStorage("food", null, "quantity") || 0;
        if (foodStock < dailyFoodNeed * 15) {
            const existingNeeds = this.agriFoodNeeds.find(item => item.type === "food");
            if (!existingNeeds) {
                this.agriFoodNeeds.push({
                    type: "food",
                    quantity: Math.ceil(dailyFoodNeed * 15), // Suffisant pour 15 jours
                    priority: "high"
                });
            }
        }

        // Vérification des ingrédients nécessaires pour produire de la nourriture
        const stock = warehouse.stock;
        combinations.forEach(combo => {
            Object.entries(combo.ingredients).forEach(([ingredient, quantity]) => {
                const stockItem  = warehouse.pickFromStorage(ingredient, null, "quantity") || 0;
                if (!stockItem || stockItem <= 50) {
                    const existingNeeds = this.agriFoodNeeds.find(item => item.type === ingredient);
                    if (!existingNeeds) {
                        this.agriFoodNeeds.push({
                            type: ingredient,
                            quantity: 50,
                            priority: "medium"
                        });
                    }
                }
            });
        });
    }

    population() {
        const warehouse = this.amenagements.find(a => a.type === "warehouse");
        let foodStock = warehouse.pickFromStorage("food", null, "quantity");
        const housingCapacity = this.houses * 5;
        const unemployed = this.workers.filter(worker => worker.type === "peasant" && !worker.workPlaceType);
        const totalNeededLabors = this.amenagements.reduce((sum, building) => sum + (building.maxLabors - building.labors), 0);
        
        // Vérification de population
        if (foodStock && foodStock > this.workers.length * 1.3 && this.workers.length < housingCapacity) {
            if (totalNeededLabors > 0 ) {
                if (this.owner){
                    this.peasantPopUp(warehouse);
                    warehouse.pickFromStorage("food", 10);
                    return;
                }

                const building = this.amenagements.find(a => a.maxLabors > a.workers.length && a.type !== "market");
                if(building) {
                    if (unemployed.length > 0) {
                        this.assignWorker(building, unemployed);
                        return;
                    }
                    building.generateWorkers();
                    warehouse.pickFromStorage("food", 10);
                }
            }else if(unemployed.length < 3){
                this.peasantPopUp(warehouse);
            }
        }

        // Réduction de population
        if (foodStock && foodStock < this.workers.length * 0.8 && this.workers.length > 1) {
            const workerToRemove = this.workers.sort((a, b) => a.level - b.level).pop();
            const buildingRemovedWorker = this.amenagements.find(b => b.id === workerToRemove.buildingID);
            buildingRemovedWorker.workers = buildingRemovedWorker.workers.filter(worker => worker.id !== workerToRemove.id)
            this.workers = this.workers.filter(worker => worker.id !== workerToRemove.id);
        }
        this.checkAndBuildHouse();
    }
    peasantPopUp(warehouse){
        const workerData = {
            type: "peasant",
            level: 1,
            workPlaceType: null,
            buildingID: null,
            villageID: this.id,
        }
        const worker = new Workers(workerData);
        this.workers.push(worker);
        warehouse.pickFromStorage("food", 10);

        // if (!this.owner) return;
        const unemployeds = this.workers.filter(worker => !worker.workPlaceType || !worker.buildingID );
        displayVillagePopulation(this.id, this.workers.length);
        displayWorkers(unemployeds, this, `#new-workers-box`);
        displayPlanConstructionBuildings(this);
    }
    assignWorker(building, unemployed){
        const worker = unemployed.shift();
        /* if (building.type === "port") {
            const flottes = building.flottes.length;
            const sailorTotal = building.sailors.length;
            let levelTotal = 0;
            building.flottes.forEach(ship => { levelTotal += ship.level; });
                
            if (sailorTotal < (levelTotal * 3)) {
                unemployed.shift();
                const workerType = buildingWorkersLevel["ship"]?.find( w => w.level === 1 )?.workerType;
                const sailor = new Sailors(building.place.x, building.place.y, workerType, 1, this.villageID, this.islandID, null);
                this.workers.push(sailor);
                building.sailors.push(sailor);
            }
            return;
        } */
        if (!worker.type || worker.type === "peasant") {
            const workerType =  buildingWorkersLevel[building.type]?.find( w => w.level === 1 )?.workerType;
            worker.type = workerType;
        }
        worker.workPlaceType = building.type;
        worker.buildingID = building.id;
        building.labors += worker.laborforce;
        building.workers.push(worker);
    }
    checkAndBuildHouse() {
        if (this.workers.length >= this.housingCapacity * 0.7 && !this.houseUnderConstruction) {
            this.houseUnderConstruction = true;

            const houseCost = { wood: 10, stone: 5 };
            const hasEnoughResources = Object.keys(houseCost).every(resource => {
                const stockItem = this.amenagements.find(a => a.type === "warehouse").stock.find(item => item.type === resource);
                return stockItem && stockItem.quantity >= houseCost[resource];
            });
            if (!hasEnoughResources) return;

            Object.keys(houseCost).forEach(resource => {
                const stockItem = this.amenagements.find(a => a.type === "warehouse").stock.find(item => item.type === resource);
                stockItem.quantity -= houseCost[resource];
            });

            setTimeout(() => {
                this.houses++;
                this.houseUnderConstruction = false;
                this.housingCapacity = this.houses * 5;
            }, 15000);
        }
    }
    consumeResources(callback) {

        const supplyNeeds = this.otherSupplyNeeds;

        const warehouse = this.amenagements.find(a => a.type === "warehouse");
        const market = this.amenagements.find(a => a.type === "market");
        this.workers.forEach(worker => {
            const workerNeeds = worker.consumption; // Obtenir les besoins du travailleur
            Object.entries(workerNeeds).forEach(([resource, quantity]) => {
                const satisfied = warehouse.pickFromStorage(resource, quantity);
                if (satisfied) {
                    worker.happiness = Math.min(worker.happiness + 0.25, 100); // Satisfaction max = 100
                } else {
                    worker.happiness -= 0.5;
                    
                    const existingNeed = supplyNeeds.find(need => need.type === resource);
                    if (!supplyNeeds) return;
                    
                    if (existingNeed && (existingNeed.quantity + quantity) < 150){
                        existingNeed.quantity += quantity;
                    }else{
                        supplyNeeds.push({
                            id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            type: resource,
                            quantity: Math.floor(quantity),
                            priority: "medium",
                        });
                    }
                }
            });

            // Effets des taxes sur la satisfaction
            if (this.baseTaxRate >= 0.7) {
                worker.happiness -= 1;
            }else if (this.baseTaxRate >= 0.6) {
                worker.happiness -= 0.6;
            }else if (this.baseTaxRate >= 0.5) {
                worker.happiness -= 0.5;
            }else if (this.baseTaxRate >= 0.4) {
                worker.happiness -= 0.3;
            }
        });

        // Vérification des outils
        const toolsStock = warehouse.pickFromStorage("tools", null, "quantity");
        const toolsNeeded = Math.ceil(this.workers.length / 3);

        if (!toolsStock || toolsStock < toolsNeeded) {
            if (!market) return;
            market.placeBuyOrder(this, "tools", market.getPrice("tools"), "consumeResources");
        }

        // Suppression des travailleurs mécontents
        this.workers = this.workers.filter(worker => {
            if (worker.happiness < 10) {
                console.log(`Worker of type ${worker.type} left the village due to low happiness.`);
                const building = this.amenagements.find(b => b.workers.includes(worker));
                if (building) {
                    building.workers = building.workers.filter(w => w.id !== worker.id);
                    building.labors -= worker.laborforce;
                }
                displayVillagePopulation(this.id, this.workers.length);
                displayPlanConstructionBuildings(this);
                return false;
            }
            return true;
        });
        displayVillageHappiness(this.id, this.getAverageHappiness());

        callback();
    }
    generateTaxes() {
        
        const happinessMultiplier = Math.min(this.getAverageHappiness() / 100, 1.5); // Max x1.5
        const taxedWorkes = this.workers.filter(worker => worker.workPlaceType !== null);
        const population = taxedWorkes.length;

        // Calcul des taxes
        const populationTax = Math.ceil(population * this.baseTaxRate * happinessMultiplier);

        // Revenus des ressources de luxe
        const resourcesTaxes = { gems_purple: 9, gems_green: 6, gems_blue: 6, gold: 6, silver: 5, copper: 5,
                                vine: 4, cacao: 4, sugar_cane: 4, tobacco: 4, coffee: 4, iron: 4, coal: 3, cotton: 3, wool: 2, wood: 2, stone: 1 } ;
        
        const resourcesRevenue = this.amenagements.reduce((total, building) => {
            const resourceType = building?.resource?.type; // Vérification des bâtiments avec ressources
            if (resourceType && resourcesTaxes[resourceType]) {
                return total + (building.level * resourcesTaxes[resourceType]);
            }
            return total;
        }, 0);
        
        const workshopAndMillTaxes = {jewelry_workshop : 15, cacao_workshop: 12, tobacco_workshop: 10,
                                coffee_workshop: 10, brewery: 10, clothing_workshop: 8, textile_mill: 7, forge: 6, lumber_mill: 5};

        const workshopRevenue = this.amenagements.reduce((total, building) => {
            if (workshopAndMillTaxes[building.type]) {
                return total + (building.level * workshopAndMillTaxes[building.type]);
            }
            return total;
        }, 0);

        // Ajout des revenus aux coffres
        const totalTaxRevenue = populationTax + resourcesRevenue + workshopRevenue;
        this.gold += totalTaxRevenue;
        displayVillageGold(this.id, this.gold);
    }
    getAverageHappiness() {
        const totalHappiness = this.workers.reduce((sum, worker) => sum + worker.happiness, 0);
        return totalHappiness / this.workers.length || 0;
    }
    checkVillageEconomy() {
        const minimumGold = 110;
        const bonusGold = 550;

        if (this.gold < minimumGold) {
            this.gold += bonusGold;
        }
    }

    planConstruction() {
        if (this.owner) return;

        const resourceBuilding = ["farm","livestock_ranches","quarry","lumberjack_hut","fishing_hut","mine","sheep_ranches"];

        this.specializationCompleted = (this.category === "general") || this.specializationBuildings.every(building => 
            this.amenagements.find(amg => amg.type === building) 
        );

        // if(!this.specializationCompleted || this.specializationBuildings.length > 0){

            this.specializationBuildings.forEach( buildingType  => {

                const existingBuilding = this.amenagements.find(b => b.type === buildingType);
                const isBuildingPlanned = this.constructionQueue.some(q => q.type === buildingType);
                
                if (existingBuilding || isBuildingPlanned) return;

                // Ajout du bâtiment au plan de construction
                const building = getBuildingInfo(buildingType, "building");
                
                if (this.checkPrerequisites(building, true)) {

                    const exists = this.amenagements.some(amenagement => amenagement.type === building.type);
                    
                    if (exists) {
                        if (resourceBuilding.includes(building.type)) {
                            const existingBuildings = this.amenagements.filter(amenagement => amenagement.type === building.type && amenagement?.resource.buildingType === building.type && amenagement.level < 3);
                            const pickOne = existingBuildings[Math.floor(Math.random() * existingBuildings.length)];
                            building.id = pickOne.id;
                            building.category = pickOne.category;
                            building.resource = pickOne.resource;
                            building.resourceId = pickOne.resourceId;
                        }else{
                            const existingBuilding = this.amenagements.find(amenagement => amenagement.type === building.type);
                            building.id = existingBuilding.id;
                            building.category = existingBuilding.category;
                            building.resource = null;
                            building.resourceId = null;
                        }
                    }
                    addBuildingToQueue(this, building, "high", true);
                }
            });

        // }

        // if(this.specializationCompleted){
            for (const [priority, buildings] of Object.entries(constructionPriorities)) {
                buildings.forEach(building => {
                    if (this.checkPrerequisites(building)) {

                        const exists = this.amenagements.some(amenagement => amenagement.type === building.type);
                        
                        if (exists) {
                            if (resourceBuilding.includes(building.type)) {
                                const existingBuildings = this.amenagements.filter(amenagement => amenagement.type === building.type && amenagement?.resource.buildingType === building.type);
                                const pickOne = existingBuildings[Math.floor(Math.random() * existingBuildings.length)];
                                if (!pickOne) {
                                    console.log(`pickOne-> undefined building.type: ${building.type}`);
                                    console.log(`pickOne-> undefined  existingBuildings: ${JSON.stringify(existingBuildings)}`);
                                    console.log(`pickOne-> undefined  pickOne: ${JSON.stringify(pickOne)}`);
                                }
                                building.id = pickOne.id;
                                building.category = pickOne.category;
                                building.resource = pickOne.resource;
                                building.resourceId = pickOne.resourceId;
                            }else{
                                const existingBuilding = this.amenagements.find(amenagement => amenagement.type === building.type);
                                building.id = existingBuilding.id;
                                building.category = existingBuilding.category;
                                building.resource = null;
                                building.resourceId = null;
                            }
                        }
                        addBuildingToQueue(this, building, priority);
                    }
                });
            }
        // }
    }
    checkPrerequisites(building, specialization = false) {
        const prerequisites = constructionPrerequisites[building.type] || [];
        
        let prerequisitesMet = prerequisites.some(req => {
            let resourcesIsOk = true;
            let buildingIsOk = true;

            if (req.resources) {
                resourcesIsOk = req.resources.some(val => this.resources.find(res => res.type === val));
            }
            if (req.building) {
                buildingIsOk = req.building.every(val => {
                    const requiredBuilding = this.amenagements.find(tb => tb.type === val);
                    return requiredBuilding && (!req.level || requiredBuilding.level >= req.level);
                });
            }
            return resourcesIsOk && buildingIsOk;
        });

        // Gestion de la population requise || allDockyards.length < 2 
        const minPop = ( building.type === "dockyard" && allDockyards.length <= 1 ) ? (building.minPopulation / 4) : 
            specialization ? (building.minPopulation / 3) : building.minPopulation;

        return prerequisitesMet && this.workers.length >= (minPop || 0);
    }

    removeFromSpecializationBuildings(buildingType){
        const index = this.specializationBuildings.indexOf(buildingType);
        if (index > -1) { 
            this.specializationBuildings.splice(index, 1); 
        }
    }
    getStock(type){
        const warehouse = this.amenagements.find(a => a.type === "warehouse");
        return warehouse.pickFromStorage(type, null, "quantity");
    }
    canAffordBuilding(building) {
        const warehouse = this.amenagements.find(a => a.type === "warehouse");
        return Object.entries(building.cost).every(([resource, quantity]) => {
            const stock = warehouse.pickFromStorage(resource, null, "quantity");
            return stock && stock >= quantity;
        });
    }
    startConstruction() {
        if (this.constructionQueue.length === 0) return;
        
        if (this.underConstruction) return;

        const nextBuilding = this.constructionQueue.shift();
        nextBuilding.startAt = Date.now();
        this.constructionSite.push(nextBuilding);
        const existingBuilding = this.amenagements.find(building => building.type === nextBuilding.type && building?.id === nextBuilding?.id);

        this.underConstruction = true;
        if (this.owner) {
            displayConstructionQueue(this, `#constructionQueue-list`);
        }
        if (existingBuilding) {
            if(existingBuilding.level >= 3) return;
            const time = existingBuilding.constructionTime * (existingBuilding.getLevel() + 1) * 1.25;

            setTimeout(() => {
                existingBuilding.upgrade();
                this.underConstruction = false;
                this.constructionSite = [];
                if (this.owner) {
                    displayConstructionQueue(this, `#constructionQueue-list`);
                    const unemployeds = this.workers.filter(worker => worker.type === "peasant" || !worker.buildingID );
                    displayWorkers(unemployeds, this, `#new-workers-box`);
                }

            }, time * 1000);
        }else {

            const buildingCat = buildingCategory(nextBuilding.type);
            setTimeout(() => {
                nextBuilding.villageID = this.id;
                nextBuilding.villagePos = this.villagePos;
                nextBuilding.level = 1;
                nextBuilding.islandID = this.islandID;
                nextBuilding.category = buildingCat ? buildingCat : null;

                this.build(nextBuilding);
                this.underConstruction = false;
                this.constructionSite = [];

                if (this.owner) {
                    displayConstructionQueue(this, `#constructionQueue-list`);
                    displayVillageAmenagements(this.id, this.amenagements.length);
                    const unemployeds = this.workers.filter(worker => worker.type === "peasant" || !worker.buildingID );
                    displayWorkers(unemployeds, this, `#new-workers-box`);
                    if (this.amenagements.length <= 3 || nextBuilding.type === "market" || nextBuilding.type === "port") {
                        showTabsBtn(this);
                    }
                }

            }, nextBuilding.constructionTime * 1000);
        }
    }
    managePopulation(){
        if (this.workers.length <= 0) return;

        this.consumeResources(() => {
            if (!this.owner) {
                this.checkVillageEconomy();
            }
            this.population();
        });
    }
}