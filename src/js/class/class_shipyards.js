
class Shipyards extends Buildings {
    constructor(data) {
        super(data);
        this.busy = false;
        this.currentProjects = [];
        this.constructionQueue = [];
        this.maxProjects = this.calculateMaxProjects();
        this.availableModels = this.getAvailableModels();
    }

    calculateMaxProjects() {
        return Math.floor(this.level * 1.5);
    }
    getAvailableModels(){
        const market = this.getBuildingVillage().market;
        return shipyardGetAvailableModels(this.level, market);
    }
    shipyardGetAvailableModelsByCategories(shipType){
        const market = this.getBuildingVillage().market;
        return shipyardGetAvailableModels(this.level, market, shipType);
    }
    checkSupplies(){
        const seuilMin = this.capacity / (this.level > 1) ? 3 : 4; // Seuil de stockage minimal pour chaque resource
        
        const warehouseIronStock = this.pickFromStorage("iron", null, "quantity") || 0;
        const warehouseCoalStock = this.pickFromStorage("coal", null, "quantity") || 0;
        const warehouseToolsStock = this.pickFromStorage("tools", null, "quantity") || 0;
        const warehouseFabricStock = this.pickFromStorage("fabric", null, "quantity") || 0;
        const warehouseLumberStock = this.pickFromStorage("lumber", null, "quantity") || 0;
        const warehouseWoodStock = this.stock.find(st => st.type === "wood")?.quantity || 0;

        const shipyardWoodStock = this.stock.find(st => st.type === "wood")?.quantity || 0;
        const shipyardIronStock = this.stock.find(st => st.type === "iron")?.quantity || 0;
        const shipyardToolsStock = this.stock.find(st => st.type === "tools")?.quantity || 0;
        const shipyardFabricStock = this.stock.find(st => st.type === "fabric")?.quantity || 0;
        const shipyardLumberStock = this.stock.find(st => st.type === "lumber")?.quantity || 0;

        const getCoalStock = () => {
            if (this.level > 1) {
                return this.stock.find(st => st.type === "coal")?.quantity || 0;
            }
            return false;
        }
        const shipyardCoalStock = getCoalStock();

        const updateStock = (type, amount) => {
            let stockItem = this.stock.find(item => item.type === type);
            if (stockItem) {
                stockItem.quantity += amount;
            } else {
                this.stock.push({ type, quantity: amount });
            }
        };
        if (shipyardIronStock < seuilMin && warehouseIronStock >= 50) {
            this.pickFromStorage("iron", 25);
            updateStock("iron", 25);
        }
        if (shipyardWoodStock < seuilMin && warehouseWoodStock > 100) {
            this.pickFromStorage("wood", 25);
            updateStock("wood", 25);
        }
        if (shipyardLumberStock < seuilMin && warehouseLumberStock >= 50) {
            this.pickFromStorage("lumber", 25);
            updateStock("lumber", 25);
        }
        if (shipyardToolsStock < seuilMin && warehouseToolsStock > 100) {
            this.pickFromStorage("tools", 25);
            updateStock("tools", 25);
        }
        if (shipyardFabricStock < seuilMin && warehouseFabricStock >= 50) {
            this.pickFromStorage("fabric", 25);
            updateStock("fabric", 25);
        }
        if (shipyardCoalStock && shipyardCoalStock < seuilMin && warehouseCoalStock > 100) {
            this.pickFromStorage("coal", 50);
            updateStock("coal", 50);
        }
    }
    selectShipModel(village, modelShip) {
        if( this.constructionQueue.length >= this.maxProjects ) return false;
        
        const ships = this.shipyardGetAvailableModelsByCategories(modelShip);
        const villageGold = village.gold;
        
        const shipPrice = (ship) => (this.villageID === village.id) ? Math.ceil(ship.price * 0.7) : ship.price;
        
        const ship = ships
                    .filter(ship => villageGold > Math.ceil(shipPrice(ship) * 1.3) && this.hasResourcesForShipConstruction(ship.cost))
                    .sort((a, b) => (b.capacity / b.price) - (a.capacity / a.price))[0]; // Priorise les cargos avec meilleur rapport capacité/prix
        
        if (ship) {
            return {shipyard: this, ship, price: Math.ceil(shipPrice(ship))};
        }
        
        return false;
    }
    hasResourcesForShipConstruction(shipCost) {
        
        return Object.entries(shipCost).every(([type, quantity]) => {
            
            const resourceStock = this.stock.find(item => item.type === type);
            return resourceStock && resourceStock.quantity >= quantity;
        });
    }
    consumeShipConstructionResources(shipCost) {
        
        Object.entries(shipCost).forEach(([type, quantity]) => {
            
            const resourceStock = this.stock.find(item => item.type === type);
            
            if (resourceStock) {
                resourceStock.quantity -= quantity;
            }
        });
    }
    startShipConstruction() {
        if(this.busy || this.constructionQueue.length === 0) return;

        const { port, shipModel } = this.constructionQueue.shift();
        this.busy = true;

        this.constructShip(port, shipModel, () => {
            this.busy = false;
            this.startShipConstruction();
        });
    }
    constructShip(port, shipModel, callback){
        const resourcesNeeded = shipModel.cost;
        let constructionTime = shipModel.constructionTime;
        
        this.consumeShipConstructionResources(resourcesNeeded);

        const baseProduction = this.production || 1; // Production de base
        const workerContribution = this.workers.reduce((total, worker) => total + worker.laborforce, 0);
        const lookForTools = this.pickFromStorage("tools", Math.ceil(this.workers.length / 2), "check");
        
        if (lookForTools) {
            this.pickFromStorage("tools", Math.ceil(this.workers.length / 2));
        }
        const toolMultiplier = lookForTools?  1.2 : 1;
        constructionTime = constructionTime / baseProduction / workerContribution / toolMultiplier;

        setTimeout(() => {
            const village = port.getBuildingVillage().village;
            
            const newShipData = {
                model: shipModel.model,
                type: shipModel.type,
                cost: shipModel.cost,
                price: shipModel.price,
                level: 1,
                villageID: village.id,
                villageName: village.name,
                villagePosition: village.villagePos,
                portID: port.id,
            }
            
            const ship = new Ships(newShipData);
            
            this.createShipSprite(ship);
            
            village.ships.push(ship);
            port.flottes.push(ship);
            port.constructionNewCargoShipFinish();

            console.log(`Ship construction finish for village : ${village.name} in shipyard village: ${this.getBuildingVillage().name}.`);
            
            if (village.id !== this.villageID) {
                
                ship.busy = true;
                const startPort = this.getBuildingVillage().position;
                const endPort = village.villagePos;
                
                const villageName = this.getBuildingVillage().name;
                const shipVillageName = village.name;
                
                ship.repairStatut = "onWayHome";
                
                simulateTravel(startPort, villageName, endPort, shipVillageName, ship, () => {
                    ship.busy = false;
                    ship.repairStatut = "";
                });
            }
            
            this.busy = false;
            
            callback();
        
        }, constructionTime);
    }
    createShipSprite(ship){
        const startDiv = document.getElementById('game-box');
        const shipSprite = document.createElement('div');
        
        shipSprite.id = `${ship.id}`;
        shipSprite.className = `ship ${ship.model}`; 
        shipSprite.dataset.name = `${ship.name}`;
        
        shipSprite.style.position = 'absolute';
        shipSprite.style.top = `${this.place.x * cellSize}px`;
        shipSprite.style.left = `${this.place.y * cellSize}px`;
        
        startDiv.appendChild(shipSprite);
    }
    
    upgrade() {
        const market = this.getBuildingVillage().market;
        super.upgrade();
        this.maxProjects = this.calculateMaxProjects(); // Augmenter le nombre de projets possibles
        this.availableModels = shipyardGetAvailableModels(this.level, market);
        console.log(`Shipyard amélioré au niveau ${this.level} !`);
    }
}