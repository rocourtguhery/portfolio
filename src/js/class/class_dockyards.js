
class Dockyards extends Buildings {
    constructor(data) {
        super(data);
        this.maxRepairsQueue = this.calculateMaxRepairs(); 
        this.currentRepairs = []; 
        this.busy = false;
        this.repairQueue = []; 
        this.baseRepairTime = 120000;
    }
    calculateMaxRepairs() {
        return this.level * 5;
    }
    checkSupplies(){
        const seuilMin = this.capacity / 4; // Seuil de stockage pour chaque resource
        const warehouseCoalStock = this.pickFromStorage("coal", null, "quantity") || 0;
        const warehouseWoodStock = this.pickFromStorage("lumber", null, "quantity") || 0;
        const warehouseToolsStock = this.pickFromStorage("tools", null, "quantity") || 0;
        const warehouseFabricStock = this.pickFromStorage("fabric", null, "quantity") || 0;

        const dockyardWoodStock = this.stock.find(st => st.type === "lumber")?.quantity || 0;
        const dockyardToolsStock = this.stock.find(st => st.type === "tools")?.quantity || 0;
        const dockyardFabricStock = this.stock.find(st => st.type === "fabric")?.quantity || 0;

        const getCoalStock = () => {
            if (this.level > 1) {
                return this.stock.find(st => st.type === "coal")?.quantity || 0;
            }
            return false;
        }
        const dockyardCoalStock = getCoalStock();
        
        const updateStock = (type, amount) => {
            let stockItem = this.stock.find(item => item.type === type);
            if (stockItem) {
                stockItem.quantity += amount;
            } else {
                this.stock.push({ type, quantity: amount });
            }
        };
        if (dockyardWoodStock < seuilMin && warehouseWoodStock > 50) {
            this.pickFromStorage("lumber", 50);
            updateStock("lumber", 50);
        }
        if (dockyardToolsStock < seuilMin && warehouseToolsStock > 100) {
            this.pickFromStorage("tools", 25);
            updateStock("tools", 25);
        }
        if (dockyardFabricStock < seuilMin && warehouseFabricStock >= 50) {
            this.pickFromStorage("fabric", 25);
            updateStock("fabric", 25);
        }
        if (dockyardCoalStock && dockyardCoalStock < seuilMin && warehouseCoalStock > 100) {
            this.pickFromStorage("coal", 50);
            updateStock("coal", 50);
        }
    }
    addToRepairQueue(ship) {
        const existInQueue = this.repairQueue.find(rq => rq.id === ship.id);
        const repairCost = this.calculateRepairCost(ship);
        const hasResources = this.hasResourcesForRepair(repairCost);

        if (this.busy || existInQueue || !hasResources ) return false;
        
        if (ship.villageID === this.villageID) {
            ship.repairStatut = "onHold";
        }
        this.repairQueue.push(ship);
        let html = `<div id="${ship.id}" class="">${ship.name}<span>statut: ${ship.repairStatut}</span><span>village: ${ship.getShipVillage().name}</span></div>`;
        if (this.repairQueue.length >= this.calculateMaxRepairs()) {
            this.busy = true;
        }
        this.selectShipToRepair();
        return this.repairQueue;
    }
    selectShipToRepair() {
        if (this.repairQueue.length <= 0 || this.currentRepairs.length > 0) return;
        const ship = this.repairQueue.find(ship => 
            this.hasResourcesForRepair(this.calculateRepairCost(ship)) && 
            ship.repairStatut === "onHold" && 
            this.currentRepairs.length === 0
        );

        if (ship) {
            this.consumeRepairResources(this.calculateRepairCost(ship));
            this.currentRepairs.push(ship);
            ship.repairStatut = "Repairing";
            this.repairShips(ship);
            
            this.repairQueue = this.repairQueue.filter(s => s.id !== ship.id);
        }
    }
    repairShips(ship) {
        const baseProduction = this.production || 1; // Production de base
        const workerContribution = this.workers.reduce((total, worker) => total + worker.laborforce, 0);
        const lookForTools = this.pickFromStorage("tools", Math.ceil(this.workers.length / 2), "check");
        if (lookForTools) {
            this.pickFromStorage("tools", Math.ceil(this.workers.length / 2));
        }
        const toolMultiplier = lookForTools?  1.2 : 1;
        const repairTime = this.baseRepairTime / baseProduction / workerContribution / toolMultiplier;
        ship.underRepair = true;
        const repairInterval = setInterval(() => {
            
            ship.damage -= 5; // Réparation
            
            if (ship.damage <= 0) {
                clearInterval(repairInterval);
                ship.damage = 0;
                
                this.currentRepairs = this.currentRepairs.filter(s => s.id !== ship.id);
                this.busy = false;
                const villageName = this.getBuildingVillage().name;
                const shipVillageName = ship.getShipVillage().name;
                if (ship.villageID === this.villageID) {
                    ship.repairStatut = null;
                    ship.busy = false;
                    ship.underRepair = false;
                    
                    return;
                }
                ship.from = villageName;
                ship.to = shipVillageName;
                const startPort = this.getBuildingVillage().position;
                const endPort = ship.getShipVillage().position;
                ship.repairStatut = "onWayHome";
                simulateTravel(startPort, villageName, endPort, shipVillageName, ship, () => {
                    ship.repairStatut = null;
                    ship.busy = false;
                    ship.underRepair = false;
                });
                
                this.selectShipToRepair();
            }
        }, repairTime / 20);
    }

    repairOtherShip(ship, dockyardVillage) {
        const repairFee = this.calculateRepairFee(ship);
        const ownerVillage = villages.find(v => v.villageID === ship.villageID);
        let hasEnoughResources = true;
        
        Object.entries(repairCost).forEach(([resource, quantity]) => {
            if (resource !== "gold") {
                const stock = ownerVillage.stock.find(item => item.type === resource)?.quantity || 0;
                if (stock < quantity) {
                    hasEnoughResources = false;
                }
            }
        });
        if (!hasEnoughResources && ownerVillage.gold < repairCost.gold) {
            // console.warn(`${ownerVillage.name} n'a pas assez de resources ou d'or pour réparer le navire.`);
            return false;
        }
        // Déduction des resources et l'or nécessaires
        Object.entries(repairCost).forEach(([resource, quantity]) => {
            if (resource !== "gold") {
                const stockItem = ownerVillage.stock.find(item => item.type === resource);
                if (stockItem) stockItem.quantity -= quantity;
            } else {
                ownerVillage.gold -= quantity;
            }
        });
        ship.damage = 0;
        return true;
    }
    calculateRepairCost(ship) {
        const baseCostMultiplier = ship.cost;
        const damageFactor = ship.damage / 100; // Exprime les dégâts en pourcentage
        const sizeFactor = ship.cargo.capacity / 300; // Adaptation du coût en fonction de la taille du navire (taille de base = 300)
        const difficultyFactor = ship.type === "warship" ? 1.3 : 1.0;
        let repairCost = {};
        for (const [resource, amount] of Object.entries(baseCostMultiplier)) {
            if (resource !== "iron") {
                repairCost[resource] = Math.ceil((amount / 2.5) * damageFactor * sizeFactor * difficultyFactor);
            }
        };
        return repairCost;
    }
    calculateRepairFee(ship) {
        const market = this.getBuildingVillage().market;
        const repairCost = this.calculateRepairCost(ship); // Appelle de la fonction de base pour calculer les resources nécessaires

        // Calcul de la valeur totale en or des fournitures nécessaires
        const totalMaterialValue = Object.entries(repairCost).reduce((sum, [resource, quantity]) => {
            return sum + (market.getPrice(resource) * quantity);
        }, 0);

        // Frais de service de 15%
        const serviceFee = Math.ceil(totalMaterialValue * 0.15);

        // Le village qui envoie le navire peut payer en fournitures, en or ou une combinaison des deux
        const totalCost = {
            //...repairCost, // Resources nécessaires
            gold: serviceFee // Frais de service à payer en or
        };

        return totalCost;
    }
    hasResourcesForRepair(repairCost) {
        return Object.entries(repairCost).every(([type, quantity]) => {
            const resourceStock = this.stock.find(item => item.type === type);
            return resourceStock && resourceStock.quantity >= quantity;
        });
    }
    consumeRepairResources(repairCost) {
        Object.entries(repairCost).forEach(([type, quantity]) => {
            const resourceStock = this.stock.find(item => item.type === type);
            if (resourceStock) {
                resourceStock.quantity -= quantity;
            }
        });
    }
    addToUpgradeQueue(ship) {
        const upgradeCost = this.calculateUpgradeCost(ship);
        if (this.hasResourcesForRepair(ship.village, upgradeCost)) {
            this.consumeRepairResources(ship.village, upgradeCost);
            this.upgradeQueue.push(ship);
            // console.log(`Navire ajouté à la file d'amélioration : ${ship.name}`);
        } else {
            // console.warn(`Pas assez de resources pour améliorer ${ship.name}`);
        }
    }
    calculateUpgradeCost(ship) {
        return {
            lumber: ship.level * 20,
            tools: ship.level * 5,
            iron: ship.level * 3
        };
    }
    upgradeShips() {
        this.upgradeQueue.forEach((ship, index) => {
            ship.level++;
            ship.speed += 0.1; // Augmentation de la vitesse
            ship.cargo.capacity += 50; // Augmentation de la capacité
            // console.log(`Amélioration terminée pour ${ship.name} au niveau ${ship.level}`);
            this.upgradeQueue.splice(index, 1); // Retirer de la file une fois amélioré
        });
    }
    upgrade() {
        super.upgrade();
        this.maxRepairsQueue = this.calculateMaxRepairs();
    }
}