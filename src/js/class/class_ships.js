
class Ships{
    constructor(data) {
        this.id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        this.name = this.getShipName();
        this.villageID = data.villageID;
        this.villageName = data.villageName;
        this.villagePosition = data.villagePosition;
        this.buildingID = data.buildingID;
        this.type = data.type;
        this.model = data.model;
        this.cost = data.cost;
        this.price = data.price;
        this.level = data.level;
        this.speed = this.calculateSpeed();
        this.maintenance = [{wood: 5, fabric: 2}];
        this.damage = 0;
        this.experience = 0;
        this.cargo = this.calculateCargo();
        this.riskFactor = 0.1;
        this.busy = false;
        this.repairStatut = null;
        this.underRepair = false;
        this.from = "-";
        this.to = "-";
        this.crew = []; // Liste des sailors assignés
    }
    getShipVillage(){
        
        const village = villages.find(village => village.id === this.villageID);
        const id = village.id;
        const name = village.name;
        
        const position = village.villagePos;
        const amenagements = village.amenagements;
        
        const resources = village.resources;
        const workers = village.workers;
        
        const port = amenagements.find(a => a.type === "port");
        const dockyard = amenagements.find(a => a.type === "dockyard");
        const shipyard = amenagements.find(a => a.type === "shipyard");
        
        return {village, id, name, position, amenagements, resources, workers, port, dockyard, shipyard };
    }
    calculateSpeed() {
        return this.level + 0.15;
    }
    calculateDamage() {
        this.damage += 0.2;
    }
    maintenanceShip(){
        this.underRepair = true;
    }
    calculateCargo() {
        return { capacity: this.level * 300, stock: [] };
    }
    assignSailor(sailor) {
        if (this.crew.length < this.level * 3) { // Par exemple : 3 sailors max par niveau
            this.crew.push(sailor);
            // console.log(`Sailor assigned to ship ID:${this.id}.`);
        } else {
            // console.warn(`This ship has reached its maximum crew capacity.`);
        }
    }
    getAdjustedSpeed() { 
        const crewBonus = this.crew.length / (this.level * 3); // Ratio d'équipage complet
        return this.speed * (1 + crewBonus * 0.25); // Bonus max : +25% avec équipage complet
    }
    getShipName(){
        const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
        const mid = syllables[Math.floor(Math.random() * syllables.length)];
        const con = connectors[Math.floor(Math.random() * connectors.length)];
        const suf = suffixes[Math.floor(Math.random() * suffixes.length)];

        // Préfixe + connecteur + suffixe
        const lengthChoice = Math.floor(Math.random() * 3);  // 0, 1 ou 2 pour court, moyen, ou long
        if (lengthChoice === 0) {
            // Court : Préfixe + suffixe
            return pre + suf;
        } else if (lengthChoice === 1) {
            // Moyen : Préfixe + connecteur + suffixe
            return pre + con + suf;
        } else {
            // Long : Préfixe + suffixe + - + syllables + suffixe
            return pre + suf + "-" + mid + suf;
        }
    }
    canCarryMore(quantity) {
        const totalCargo = this.cargo.stock.reduce((sum, item) => sum + item.quantity, 0);
        return totalCargo + quantity <= this.cargo.capacity;
    }
    addToCargo(resourceType, quantity) {
        const existingResource = this.cargo.stock.find(item => item.type === resourceType);
        if (existingResource) {
            existingResource.quantity += quantity;
        } else {
            this.cargo.stock.push({ type: resourceType, quantity });
        }
    }
    clearCargo() {
        this.busy = false;
        this.crew = [];
        this.cargo.stock = [];
        this.from = "-";
        this.to = "-";
    }
    travelInfo(from, to, cargo) {
        return{from: this.from, To: this.to, Cargo: this.displayStock()};
    }
    displayStock(){
        let html = "";
        this.cargo.stock.forEach( e => {
            html += `<span>${e.type} : ${e.quantity}</span>`;
        });
        return html;
    }
    travel(port, villageBuyer, villageSeller) {
        const transportUnit = this;
        transportUnit.from = villageSeller.name;
        transportUnit.to = villageBuyer.name;
        const pathGo = `${villageBuyer.villagePos.x},${villageBuyer.villagePos.y}-${villageSeller.villagePos.x},${villageSeller.villagePos.y}`;
        const pathBack = `${villageSeller.villagePos.x},${villageSeller.villagePos.y}-${villageBuyer.villagePos.x},${villageBuyer.villagePos.y}`;
        const marketBuyer = villageBuyer.amenagements.find(building => building.type === "market");
        const marketSeller = villageSeller.amenagements.find(building => building.type === "market");
        if(pathCache.has(pathGo) && pathCache.has(pathBack)){

            // Déplacement du navire
            $(`#${transportUnit.id}`).fadeIn(1000);
            animatePath(transportUnit, pathCache.get(pathGo), () => {

                completeTheTransaction(villageBuyer, marketBuyer, villageSeller, marketSeller, transportUnit);

                const portSeller = villageSeller.amenagements.find(building => building.type === "port");
                const dockerContribution = portSeller.workers.length > 0 ? portSeller.workers.reduce((total, worker) => total + worker.laborforce, 0) : 1;
                const preparationTime = Math.floor(5000 / dockerContribution);
                
                setTimeout(() => {
                    transportUnit.from = villageSeller.name;
                    transportUnit.to = villageBuyer.name;

                    animatePath(transportUnit, pathCache.get(pathBack), () => {
                        transportUnit.from = "-";
                        transportUnit.to = "-";
                        port.unloadGoods(transportUnit);
                        this.gainExperience(0.05);
                        portSeller.portsGainExperience(0.05);
                    });

                }, preparationTime);

            });
        }else{
            simulateTravel(villageBuyer.villagePos, villageBuyer.name, villageSeller.villagePos, villageSeller.name, transportUnit, () => {
                
                completeTheTransaction(villageBuyer, marketBuyer, villageSeller, marketSeller, transportUnit);
                
                const portSeller = villageSeller.amenagements.find(building => building.type === "port");
                const dockerContribution = portSeller.workers.length > 0 ? portSeller.workers.reduce((total, worker) => total + worker.laborforce, 0) : 1;
                const preparationTime = Math.floor(5000 / dockerContribution);
                
                setTimeout(() => {
                    transportUnit.from = villageSeller.name;
                    transportUnit.to = villageBuyer.name;
                    
                    simulateTravel(villageSeller.villagePos, villageSeller.name, villageBuyer.villagePos, villageBuyer.name, transportUnit, () => {
                        transportUnit.from = "-";
                        transportUnit.to = "-";
                        port.unloadGoods(transportUnit);
                        this.gainExperience(0.05);
                        portSeller.portsGainExperience(0.05);
                    })
                
                }, preparationTime);
            });
        }
    }
    goToRepair(dockyard){
        if (this.repairStatut === "onWay" || this.repairStatut === "onHold") return;
        this.underRepair = true;
        this.busy = true;
        
        const transportUnit = this;
        const villageName = this.getShipVillage().name;
        const dockyardVillageName = dockyard.getBuildingVillage().name;
       
        transportUnit.from = villageName;
        transportUnit.to = dockyardVillageName;
        
        const startPort = transportUnit.getShipVillage().position;
        const endPort = dockyard.getBuildingVillage().position;
        
        transportUnit.repairStatut = "onWay";
       
        simulateTravel(startPort, villageName, endPort, dockyardVillageName, transportUnit, () => {
            transportUnit.repairStatut = "onHold";
        });
    }
    gainExperience(amount) {
        this.experience += amount;
        if (this.experience >= this.getLevelUpThreshold() && this.level < 3) {
            console.log(`SHIP levelUp();`);
            // TO DO up ship level
        }
    }
    getLevelUpThreshold() {
        return this.level * 100;
    }
}