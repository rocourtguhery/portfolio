
class Ports extends Buildings {
    constructor(data) {
        super(data);
        this.villageName = data.villageName;
        this.maxFlottes = this.calculateMaxFlottes(); 
        this.flottes = [];
        this.sailors = [];
        this.needCargoShip = 0;
        this.needCargoShipThreshold = this.calculateCargoShipThreshold();
        this.maxSailors = this.calculateMaxSailors();
        this.range = this.range();
    }
    calculateMaxLabors() {
        return (this.maxLabors - 1 > 0)? this.level * 2 : 2;
    }
    calculateMaxFlottes() {
        return (this.level - 1 > 0)? this.level * 5 : 4;
    }
    calculateMaxSailors() {
        return Math.ceil(this.flottes.length * this.level * 1.5);
    }
    calculateCargoShipThreshold() {
        return (this.flottes.length <= 2)? 500 : 500 * (this.flottes.length * 0.4);
    }
    addShip() {
        if (this.flottes.length >= this.maxFlottes) return;
        const village = this.getBuildingVillage().village;
        const market = this.getBuildingVillage().market;
        const shipModels = shipyardGetAvailableModels(1, market, "cargo");
        const shipType = shipModels.find(ship => ship.model === "chatte");
        const newShipData = {
            model: shipType.model,
            type: shipType.type,
            cost: shipType.cost,
            price: shipType.price,
            level: 1,
            villageID: village.id,
            villageName: village.name,
            villagePosition: village.position,
            portID: this.id,
        }
        const ship = new Ships(newShipData);
        village.ships.push(ship);
        this.flottes.push(ship);
        const startDiv = document.getElementById('game-box');
        const shipSprite = document.createElement('div');
        shipSprite.id = `${ship.id}`;
        shipSprite.className = `ship ${ship.model}`; 
        shipSprite.dataset.name = `${ship.name}`;
        shipSprite.style.position = 'absolute';
        shipSprite.style.top = `${this.place.x * cellSize}px`;
        shipSprite.style.left = `${this.place.y * cellSize}px`;
        startDiv.appendChild(shipSprite);
        const sailorsData = {
            type: "sailor",
            level: 2,
            workPlace: this.type,
            villageID: village.id,
            villageName: village.name,
            buildingID: this.id,
        }
        const sailor = new Sailors(sailorsData);
        village.workers.push(sailor);
        this.sailors.push(sailor);
    }
    generateSailors() { 
        if (this.sailors.length >= this.maxSailors) return;
        const workerTypeForLevel = buildingWorkersLevel["ship"]?.find(
            w => w.level === 1
        )?.workerType;
        const sailorsData = {
            type: workerTypeForLevel,
            level: 1,
            workPlace: this.type,
            villageID: village.id,
            buildingID: this.id,
        }
        const sailor = new Sailors(sailorsData);
        village.workers.push(sailor);
        this.sailors.push(sailor);
        this.labors += worker.laborforce;
    }
    range() {
        const baseRange = (gridSize.y / 2); // Portée de base
        return baseRange + (this.level * 4); // Ajoute 4 cellules par niveau
    }
    portsGainExperience(amount) {
        const xpMultiplicator = (this.workers.length >= this.maxLabors)? 1.25 : 1;
        this.nextLevelProgress += xpMultiplicator * amount;
        if ( this.nextLevelProgress >= this.getLevelUpThreshold() && this.level < 3  ) {
            this.planUpgrade();
        }
    }
    getLevelUpThreshold() {
        return this.level * 200;
    }
    planMaritimeRoute(villageBuyer, villageSeller) {
        const dockyard = this.getBuildingVillage().dockyard;
        if(dockyard) dockyard.selectShipToRepair();
        const ship = this.flottes.find(ship => ship.type === "cargo" && !ship.busy);
        
        if(!ship) this.needCargoShip = Math.max(this.needCargoShipThreshold, (this.needCargoShip + 0.5));

        if (!ship || ship.busy || ship.underRepair) {
            return false;
        }
        ship.busy = true;
        const dockerContribution = this.workers.length > 0 ? this.workers.reduce((total, worker) => total + worker.laborforce, 0) : 1;
        const preparationTime = Math.floor(5000 / dockerContribution);
        setTimeout(() => {
            this.processMaritimeRoutes(ship, villageBuyer, villageSeller)
            this.portsGainExperience(0.15);
        }, preparationTime);
        
    }
    canTrade(){
        return this.flottes.some(ship => ship.type === "cargo" && !ship.busy && !ship.underRepair);
    }
    processMaritimeRoutes(ship, villageBuyer, villageSeller) {
        ship.travel(this, villageBuyer, villageSeller);
    }
    unloadGoods(ship) {
        const dockerContribution = this.workers.length > 0 ? this.workers.reduce((total, worker) => total + worker.laborforce, 0) : 1;
        const unloadTime = Math.floor(5000 / dockerContribution);
        const warehouse = this.getBuildingVillage().warehouse;
        const dockyard = this.getBuildingVillage().dockyard;
        setTimeout(() => {
            ship.cargo.stock.forEach(resource => {
                warehouse.addToStock(resource.type, resource.quantity);
            });
            this.planShipRepair(ship, ( req ) => {
                ship.clearCargo(); // Vide le cargo et réinitialise l'état du navire
                const repairQueue = req.queue;
                const repairDockyard = req.dockyard;
                const shipToBeRepaired = req.shipToBeRepaired;
                if (req.status && repairDockyard && shipToBeRepaired) {
                    shipToBeRepaired.goToRepair(repairDockyard);
                }
            });
        }, unloadTime);
        if(dockyard && dockyard.workers.length > 0) {
            dockyard.checkSupplies();
            dockyard.selectShipToRepair();
        };
        this.portsGainExperience(0.2);
    }
    evaluateMaritimeNeeds() {
        const shipyardsVillages = villages.filter(village => 
                                            village.amenagements.find(building => building.type === "shipyard") && 
                                            village.workers.length > 0);
        const dockyardsVillages = villages.filter(village => 
                                            village.amenagements.find(building => building.type === "dockyard" && 
                                            building.villageID !== this.villageID) && 
                                            village.workers.length > 0);
        let shipyardAvailable = null;
        let dockyardAvailable = this.findNearbyDockyard(dockyardsVillages);
                    
        if (shipyardsVillages.length > 0) {
            shipyardAvailable = this.findNearbyShipyard(shipyardsVillages);
        }
        const damagedShips = this.flottes.filter(ship => ship.damage > 70); // Navires endommagés critiques
        const idleShips = this.flottes.filter(ship => !ship.busy); // Navires disponibles
        const totalShips = this.flottes.length;
        let needRepair = false;
        let needNewCargoShips = false;
        let needNewWarShips = false; 
        let needTrawlerShips = false; 
        // Besoin de réparations
        if (damagedShips.length > 0) {
            needRepair = true;
        }
        // Besoin de nouveaux navires
        if (this.needCargoShip >= this.needCargoShipThreshold && totalShips < this.calculateMaxFlottes()) {
            needNewCargoShips = true;
        }
        return { 
            needRepair, 
            needNewCargoShips, 
            needNewWarShips,
            needTrawlerShips,
            damagedShips, 
            dockyardAvailable, 
            shipyardAvailable, 
            shipyardsVillages, 
            dockyardsVillages
        }
    }
    planShipRepair(ship, callback) {
        const { needRepair, damagedShips, dockyardAvailable} = this.evaluateMaritimeNeeds();
        const village = this.getBuildingVillage().village;
        let addToQueue = [];
        let status = false;
        let callbackData = {status:false, queue: [], dockyard: null, shipToBeRepaired: null};
        if (needRepair && dockyardAvailable) {
            const shipToBeRepaired = damagedShips.find(dmgShip => dmgShip.id === ship.id && !dmgShip.underRepair);
            if(shipToBeRepaired){
                const repairFee = dockyardAvailable.calculateRepairFee(shipToBeRepaired);
                const shipVillage = shipToBeRepaired.getShipVillage().village;
                const canPay = village.gold > repairFee.gold;
                const dockyard = this.getBuildingVillage().dockyard;
                addToQueue = dockyard ?
                            dockyard.addToRepairQueue(ship) :
                            canPay ? dockyardAvailable.addToRepairQueue(ship) : [];
                status = addToQueue.length > 0;
                if (status && dockyard) {
                    shipToBeRepaired.underRepair = true;
                    callbackData = {status, queue: addToQueue, dockyard: null, shipToBeRepaired: null};
                }
                if (status && !dockyard) {
                    shipToBeRepaired.underRepair = true;
                    shipVillage.gold -= repairFee.gold;
                    const dockyardVillage = dockyardAvailable.getBuildingVillage().village;
                    dockyardVillage.gold += repairFee.gold;
                    callbackData = {status, queue: addToQueue, dockyard: dockyardAvailable, shipToBeRepaired};
                }
            }
        }
        callback(callbackData);
    }
    planShipConstruction() {
        const { needNewCargoShips, needNewWarShips, needTrawlerShips, shipyardAvailable, shipyardsVillages} = this.evaluateMaritimeNeeds();
        const village = this.getBuildingVillage().village;
        const modelShip = (needNewCargoShips) ? "cargo" :
                            (needNewWarShips) ? "warship" :
                            (needTrawlerShips) ? "fishing_boat" : null;
        if (shipyardAvailable && shipyardAvailable?.length > 0 && modelShip) {
            for (const shipyard of shipyardAvailable) {
                const canConstructShip = shipyard.selectShipModel(village, modelShip);

                if (canConstructShip){
                    const shipyard = canConstructShip.shipyard;
                    const shipModel = canConstructShip.ship;
                    village.gold -= canConstructShip.price;
                    shipyard.constructionQueue.push({port: this, shipModel});
                    if(!shipyard.busy) shipyard.startShipConstruction();
                    break;
                };
            }
        }
    }
    constructionNewCargoShipFinish(){
        this.needCargoShip = 0;
        this.needCargoShipThreshold = this.calculateCargoShipThreshold();
    }
    findNearbyDockyard(dockyardsVillages) {
        return dockyardsVillages.map(village => ({
            dockyard: village.amenagements.find(a => a.type === "dockyard" && a.workers.length > 0),
            distance: calculateTravelTime(this.place, village.villagePos),
            queueSize: village.amenagements.find(a => a.type === "dockyard").repairQueue.length
        })).sort((a, b) => (a.queueSize - b.queueSize) || (a.distance - b.distance))[0]?.dockyard;
    }
    findNearbyShipyard(shipyardsVillages) {
        return shipyardsVillages.map(village => {
            const shipyard = village.amenagements.find(a => a.type === "shipyard" && a.workers.length > 0 && !a.busy);
            if (!shipyard) return null;
            return {
                shipyard,
                distance: calculateTravelTime(this.place, village.villagePos),
                queueSize: shipyard.constructionQueue.length
            }
        })
        .filter(entry => entry)
        .sort((a, b) => (a.queueSize - b.queueSize) || (a.distance - b.distance))
        .map(entry => entry.shipyard);
    }
    upgrade() {
        super.upgrade();
        this.maxSailors = this.calculateMaxLabors();
        this.maxFlottes = this.calculateMaxFlottes();
    }
}