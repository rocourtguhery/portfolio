class Buildings{
    constructor(data) {
        this.id = `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        this.islandID = data.islandID;
        this.villageID = data.villageID;
        this.type = data.type; // Type de bâtiment (mine, ferme, etc.)
        this.category = data.category; 
        this.resource = data.resource;
        this.resourceId = data.resourceId;
        this.constructionTime = data.constructionTime;
        this.minPopulation = data.minPopulation;
        this.cost = data.cost; // Coût en matériaux
        this.place = data.villagePos; // Emplacement
        this.level = data.level;
        this.labors = 0;
        this.maxLabors =  this.calculateMaxLabors(); // Max travailleurs
        this.workers = []; 
        this.capacity = 600;
        this.stock = []; 
        this.baseProduction = this.buildingBaseProduction(); // Production de base par tick
        this.workshopProduction = [];
        this.nextLevelProgress = 0;
    }
    buildingBaseProduction() {
        const production = amenagementProduction(this.type);
        return production * this.level;
    }
    calculateMaxLabors() {
        if (!["townhall", "warehouse", "granary", "barracks", "theater"].includes(this.type)) {
            return this.level * 3;
        }else{
            return 0;
        }
    }
    getLevel(){
        return this.level;
    }
    generateWorkers() {
        const village = this.getBuildingVillage().village;
        if (!village.owner && this.workers.length >= this.maxLabors) return;
        const workerTypeForLevel = buildingWorkersLevel[this.type]?.find(
            w => w.level === 1
        )?.workerType;
        const workerData = {
            type: workerTypeForLevel,
            level: 1,
            workPlaceType: this.type,
            villageID: this.villageID,
            buildingID: this.id,
        }
        const worker = new Workers(workerData);
        village.workers.push(worker);
        this.workers.push(worker);
        this.labors += worker.laborforce;
        displayVillagePopulation(village.id, village.workers.length);
    }
    getBuildingVillage(){
        const village = villages.find(village => village.id === this.villageID);
        const id = village.id;
        const name = village.name;
        const position = village.villagePos;
        const amenagements = village.amenagements;
        const resources = village.resources;
        const workers = village.workers;
        const granary = amenagements.find(a => a.type === "granary");
        const warehouse = amenagements.find(a => a.type === "warehouse");
        const port = amenagements.find(a => a.type === "port");
        const market = amenagements.find(a => a.type === "market");
        const dockyard = amenagements.find(a => a.type === "dockyard");
        const shipyard = amenagements.find(a => a.type === "shipyard");
        return {village, id, name, position, amenagements, resources, workers, granary, warehouse, market, port, dockyard, shipyard };
    }
    calculateProduction() {
        const granary = this.getBuildingVillage().granary;
        const warehouse = this.getBuildingVillage().warehouse;
        const depotCapacity = warehouse.capacity;
        const depotStock = warehouse.stock.reduce((sum, item) => sum + item.quantity, 0);

        if (depotStock >= depotCapacity || this.workers.length <= 0) return;

        if (this.category === "amenagement") {

            const resourceType = this.resource.type;

            if( !warehouse.canProduct(resourceType) ) return;

            const quantity = this.calculateBuildingProduction();

            if (granary && granary.allowedResources.includes(resourceType)) {
                granary.addToStock(resourceType, quantity);
            } else {
                warehouse.addToStock(resourceType, quantity);
            }
        }
        // Production avancée : bâtiments de type atelier
        if (this.category === "workshop"){

            const production = workshopProduction[this.type][0].result.type;
            
            if( !warehouse.canProduct(production) ) return;

            const product = this.handleWorkshopProduction();

            if (product) {
                warehouse.addToStock(product.type, product.quantity);
            }
        } 
    }
    calculateBuildingProduction(xp = true) {
        const baseProduction = this.production || 1; // Production de base
        const workers = this.workers;
        const workerContribution = workers.reduce((total, worker) => total + worker.laborforce, 0);
        const lookForTools = this.pickFromStorage("tools", Math.ceil(workers.length / 2), "check");
        
        if (lookForTools) {
            this.pickFromStorage("tools", Math.ceil(workers.length / 2));
        }

        const toolMultiplier = lookForTools?  1.5 : 0.8;

        let millMultiplier = 1;

        if (this.resource && this.resource?.type === "cereals") {

            millMultiplier = this.getBuildingVillage().amenagements
            .filter(a => a.type === "mill")
                .reduce((total, mill) => {

                    const millers = mill.workers;
                    const millerContribution = millers.reduce((sum, worker) => {

                        if (xp) {
                            worker.gainExperience(0.05);
                        }
                        return sum + worker.laborforce;

                    }, 0);

                    return total + (1.5 * millerContribution);

            }, 1);
        }

        if (xp) {
            workers.forEach(w => {
                w.gainExperience(0.05);
            });
    
            this.buildingGainExperience(0.5);
        }

        return baseProduction * workerContribution * toolMultiplier * millMultiplier;
    }
    showBuildingProd(){
        const baseProduction = this.production || 1; // Production de base
        const workers = this.workers;
        const workerContribution = workers.reduce((total, worker) => total + worker.laborforce, 0);
        const lookForTools = this.pickFromStorage("tools", Math.ceil(workers.length / 2), "check");
        const toolMultiplier = lookForTools?  1.5 : 0.8;
        let millMultiplier = 1;
        if (this.resource && this.resource?.type === "cereals") {
            millMultiplier = this.getBuildingVillage().amenagements
            .filter(a => a.type === "mill")
                .reduce((total, mill) => {
                    const millers = mill.workers;
                    const millerContribution = millers.reduce((sum, worker) => {
                        return sum + worker.laborforce;
                    }, 0);
                    return total + (1.5 * millerContribution);
            }, 1);
        }
        const prod = baseProduction * workerContribution * toolMultiplier * millMultiplier;
        const bonus = {tools: `x1.5 | x0.8`};
        if (this.resource && this.resource?.type === "cereals") {
            bonus["mill"] = `x${millMultiplier > 1? 0: millMultiplier}`;
        }
        return {prod, bonus};
    }

    handleWorkshopProduction() {
        const village = this.getBuildingVillage().village;
        const market = this.getBuildingVillage().market;

        const productionOptions = village.owner ? this.workshopProduction : workshopProduction[this.type];

        const production = this.calculateBuildingProduction();
        
        const productionOption = productionOptions.find(option => {

            return Object.entries(option.resources).every(([resource, quantity]) => {

                const stock = this.pickFromStorage(resource, null, "quantity");

                return stock && stock >= quantity;
                
            }) && this.level >= option.minLevel;

        });

        if (productionOption) {

            Object.entries(productionOption.resources).forEach(([resource, quantity]) => {

                this.pickFromStorage(resource, Math.ceil(quantity))

            });

            const { type, quantity } = productionOption.result;
            // console.log(`${this.village.name} a produit ${quantity} unités de ${type} dans ${this.type}.`);
            return { type, quantity: (quantity * production) };
        } else {
            const supplyNeeds = village.otherSupplyNeeds;

            const resourceShortages = {};

            productionOptions.forEach(option => {
                Object.entries(option.resources).forEach(([resource, quantity]) => {
                    const stock = this.pickFromStorage(resource, null, "quantity");
                    if (!stock || stock < quantity) {
                        resourceShortages[resource] = Math.max(resourceShortages[resource] || 0, quantity - (stock || 0));
                    }
                });
            });

            Object.entries(resourceShortages).forEach(([resource, quantity]) => {
                
                const existingNeed = supplyNeeds.find(need => need.type === resource);
                const overload = existingNeed && existingNeed.quantity >= 150;

                if (overload) return;

                if (existingNeed){

                    existingNeed.quantity += Math.floor(quantity);

                }else{
                    supplyNeeds.push({
                        id: `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                        type: resource,
                        quantity: Math.floor(quantity),
                        priority: "medium",
                    });
                    market.marketCanSell.filter(canSell => canSell.type !== resource && canSell.quantity > 0);
                }
            });
            return null;
        }
    }
    pickFromStorage(resourceType, quantity = 0, condition = "pick") {
        const village = this.getBuildingVillage().village;
        
        const storages = [
            this.getBuildingVillage().granary?.stock,
            this.getBuildingVillage().warehouse?.stock
        ];
        for (let storage of storages) {
            if (!storage) continue; // Si le stockage n'existe pas, on passe au suivant
            const stockItem = storage.find(item => item.type === resourceType);
            if (stockItem && condition == "quantity") return stockItem.quantity;

            if (stockItem && stockItem.quantity >= quantity) {

                if (condition == "check") return true;

                stockItem.quantity -= quantity;

                // Nettoyer si la quantité devient 0
                if (stockItem.quantity <= 0) {
                    storage = storage.filter(item => item.quantity > 0);
                }
                updateWarehouseResources(this.villageID, stockItem.stockId, stockItem.quantity);
                return quantity; // Retourne la quantité consommée
            }
        }
        return false;
    }
    buildingGainExperience(amount) {
        const village = this.getBuildingVillage().village;
        const xpMultiplicator = (this.workers.length >= this.maxLabors)? 1.5 : 1;
        this.nextLevelProgress += xpMultiplicator * amount;
        const pourcentageProgress = (this.nextLevelProgress * 100) / this.getLevelUpThreshold();
        upgradeBuildingcheck(this, pourcentageProgress);
        if (this.nextLevelProgress >= this.getLevelUpThreshold() && this.level < 3  && !village.owner) {
            this.planUpgrade();
        }
    }
    getLevelUpThreshold() {
        return this.level * 200;
    }
    planUpgrade() {
        const village = this.getBuildingVillage().village;
        if (this.level >= 3) return;
        if (village.constructionQueue.some(q => q.type === this.type)) return;
        addBuildingToQueue(village, this, "medium");
    }
    calculateCostForNextLevel() {
        return Object.fromEntries(
            Object.entries(this.cost).map(([resource, quantity]) => [
                resource,
                Math.ceil((this.level + 1) * quantity * 1.25)
            ])
        );
    }
    upgrade() {
        this.level += 1;
        this.maxLabors = this.calculateMaxLabors();
        this.baseProduction = this.buildingBaseProduction();
    }
}