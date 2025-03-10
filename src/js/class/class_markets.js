
class Markets extends Buildings {
    constructor(data) {
        super(data);
        this.buyOrders = []; // { villageID, resourceType, quantity, price }
        this.sellOrders = []; // { villageID, resourceType, quantity, price }
        this.villageName = data.villageName;
        this.priceFluctuation = {};
        this.initializePriceFluctuations();
        this.expirationTime = 180000; // Temps d'expiration en millisecondes (180 secondes)
    }
    calculateMaxLabors() {
        return (this.level - 1 > 0)? this.level * 2 : 1;
    }

    // initialisation des fluctuations de prix
    initializePriceFluctuations() {
        Object.keys(basePrices).forEach(resource => {
            this.priceFluctuation[resource] = basePrices[resource];
        });
    }

    // Générer des travailleurs
    generateWorkers() {
        if (this.workers.length >= this.maxLabors) return;
        const workerTypeForLevel = buildingWorkersLevel[this.type]?.find(
            w => w.level === 1
        )?.workerType;
        const merchantData = {
            type: workerTypeForLevel,
            level: 1,
            workPlace: this.type,
            villageID: this.villageID,
            buildingID: this.id,
        }
        const merchant = new Merchants(merchantData);
        const village = this.getBuildingVillage().village;
        village.workers.push(merchant);
        this.workers.push(merchant);
        this.labors += merchant.laborforce;
        displayVillagePopulation(village.id, village.workers.length);
        displayPlanConstructionBuildings(village);
    }

    // Passer des commandes d'achat
    placeBuyOrder(villageID, resourceType, price, from = null) {
        const warehouse = this.getBuildingVillage().warehouse;
        const fixedQty = 50;
        const fixedCeiling = warehouse.dynamicCap();
        const stockItem  = this.pickFromStorage(resourceType, null, "quantity") || 0;
        if(stockItem >= fixedCeiling) return;

        const existingOrder = this.buyOrders.some(order => order.type === resourceType);
        
        if (existingOrder && (existingOrder.quantity + fixedQty) < 100) {
            existingOrder.quantity += fixedQty;
        }else if (!existingOrder){

            this.buyOrders.push({ 
                villageID, 
                type: resourceType, 
                quantity: fixedQty, 
                price,
                buyFrom: null,
                timestamp: Date.now() });
        }
    }

    // Passer des ordres de vente
    placeSellOrder(villageID, resourceType, quantity, price) {
        this.sellOrders.push({
            villageID,
            type: resourceType,
            quantity: Math.floor(quantity),
            price,
            soldTo: null,
            timestamp: Date.now(), });
    }
    evaluateMarketsNeeds(callback){
        // Évaluation des besoins

        const village = this.getBuildingVillage().village;
        const dockyard = this.getBuildingVillage().dockyard;
        const shipyard = this.getBuildingVillage().shipyard;
        const warehouse = this.getBuildingVillage().warehouse;
        if(dockyard){
            const dockyardSupplies = {
                tools : dockyard.stock.find(st => st.type === "tools")?.quantity || 0,
                fabric : dockyard.stock.find(st => st.type === "fabric")?.quantity || 0,
                lumber : dockyard.stock.find(st => st.type === "lumber")?.quantity || 0,
            }
            const warehouseStock = {
                tools : this.pickFromStorage("tools", null, "quantity") || 0,
                fabric : this.pickFromStorage("fabric", null, "quantity") || 0,
                lumber : this.pickFromStorage("lumber", null, "quantity") || 0,
            }
            const seuilMin = dockyard.capacity / 4;

            Object.entries(dockyardSupplies).forEach(element => {
                if (dockyard && dockyardSupplies[element] < seuilMin && warehouseStock[element] < 100) {
                    // Ajoute des ressources a la liste des besoins
                    const supplyNeeds = village.otherSupplyNeeds;
                    supplyNeeds.push({
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        type: element,
                        quantity: 100,
                        priority: "high",
                    });
                }
            });
        }
        if(shipyard){
            const shipyardSupplies = {
                iron : shipyard.stock.find(st => st.type === "iron")?.quantity || 0,
                tools : shipyard.stock.find(st => st.type === "tools")?.quantity || 0,
                fabric : shipyard.stock.find(st => st.type === "fabric")?.quantity || 0,
                lumber : shipyard.stock.find(st => st.type === "lumber")?.quantity || 0,
            }
            const warehouseStock = {
                iron : this.pickFromStorage("iron", null, "quantity") || 0,
                tools : this.pickFromStorage("tools", null, "quantity") || 0,
                fabric : this.pickFromStorage("fabric", null, "quantity") || 0,
                lumber : this.pickFromStorage("lumber", null, "quantity") || 0,
            }

            const seuilMin = shipyard.capacity / 4;

            if ((shipyard && shipyard.level > 1) || (dockyard && dockyard.level > 1)) {
                shipyardSupplies["coal"] = 0;
            }

            Object.entries(shipyardSupplies).forEach(element => {
                
                if (shipyard && shipyardSupplies[element] < seuilMin && warehouseStock[element] < 100) {
                    // Ajoute des ressources a la liste des besoins
                    const supplyNeeds = village.otherSupplyNeeds;
                    supplyNeeds.push({
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        type: element,
                        quantity: 100,
                        priority: "high",
                    });
                }
            });
        }

        let needs = [...village.otherSupplyNeeds, ...village.agriFoodNeeds];
        
        needs.sort((a, b) => {
            if (a.priority === "high" && b.priority !== "high") return -1;
            if (a.priority !== "high" && b.priority === "high") return 1;
            return b.quantity - a.quantity;
        });
        needs.forEach(need => {
            // Passer des commandes d'achat

            const existingOrder = this.buyOrders.some(order => order.type === need.type);
            if (!existingOrder || existingOrder.quantity < need.quantity) {
                this.placeBuyOrder(this.villageID, need.type, null, "evaluateMarketsNeeds");
            }
            if (existingOrder && existingOrder.quantity >= 100) {
                village.otherSupplyNeeds = village.otherSupplyNeeds.filter(n => n.id !== need.id && need.quantity > 0);
                village.agriFoodNeeds = village.agriFoodNeeds.filter(n => n.id !== need.id && need.quantity > 0);
            }
        });

        const nearbyMarkets = findNearbyMarket(village);

        nearbyMarkets.forEach(market => {
            // Passer des ordres de vente

            if (market.villageID === this.villageID) return;

            market.buyOrders.forEach(order => {

                const itemStock = this.pickFromStorage(order.type, null, "quantity");

                const fixedCeiling = (order.type === "food")? warehouse.foodQuotaCap() : warehouse.dynamicCap();

                if (itemStock && itemStock >= fixedCeiling && this.canSell(order.type) ) {
                    this.placeSellOrder(this.villageID, order.type, 50, this.getPrice(order.type));
                }

            });
        });
        callback();
    }
    canSell(resourceType) {
        const warehouse = this.getBuildingVillage().warehouse;

        const alreadyOnSale = this.sellOrders.reduce((sum, item) => {
            return item.type === resourceType ? sum + item.quantity : sum;
        }, 0);

        if (resourceType === "food" && alreadyOnSale >= (this.level * 100) )  return false;

        const dynamicLimit = Math.max(warehouse.dynamicCap(), alreadyOnSale * 1.2);

        if (alreadyOnSale >= dynamicLimit) return false;
        
        return true;
    }
    planPurchases() {
        const village = this.getBuildingVillage().village;
        const workers = this.getBuildingVillage().workers;
        if (workers.length <= 0) return;
        const port = this.getBuildingVillage().port;
        
        let merchantTrade = [];
        let shipTrade = [];

        // Recherche de marché à proximité
        const nearbyMarkets = findNearbyMarket(village).map(market => {
            market.sellOrders.sort((a, b) => a.price - b.price);
            return market;
        });

        const needs = [...this.buyOrders];

        const merchant = this.workers.find(merchant => !merchant.busy); // Sélection d'unité disponible (commerçant)
        const ship = port.flottes.find(ship => ship.type === "cargo" && !ship.busy && !ship.underRepair); // Sélection d'unité disponible (navire)
        
        needs.forEach(need => {
            let bestMarket = null;
            let bestPrice = Infinity;

            nearbyMarkets.forEach(market => {
                const bestOffer = market.sellOrders.find(sell => sell.type === need.type && sell.quantity > 0 && sell.soldTo === null);
                if (bestOffer && bestOffer.price < bestPrice) {
                    bestMarket = market;
                    bestPrice = bestOffer.price;
                }
            });

            if (!bestMarket || !this.canTrade() || !port.canTrade()) return;

            bestMarket.sellOrders.forEach(sell => {
                if (sell.type === need.type && sell.quantity > 0 && sell.soldTo === null) {
                    if (village.gold < (sell.quantity * sell.price) ) return;

                    if (bestMarket.islandID === this.islandID) {

                        if( !merchant || !this.canTrade() || !merchant.canCarryMore(sell.quantity) ) return;

                        need.buyFrom = bestMarket.villageID;
                        sell.soldTo = this.villageID;
                        merchantTrade.push(sell);

                    }else {

                        if( !ship || !port.canTrade() || !ship.canCarryMore(sell.quantity) ) return;

                        need.buyFrom = bestMarket.villageID;
                        sell.soldTo = this.villageID;
                        shipTrade.push(sell);
                    }
                }
            });
            
            if (merchantTrade.length > 0) {
                this.trade(bestMarket);
            }
            if (shipTrade.length > 0) {
                const villageBuyer = this.getBuildingVillage().village;
                const villageSeller = bestMarket.getBuildingVillage().village;
                port.planMaritimeRoute(villageBuyer, villageSeller);
            }
        });
    }
    canTrade(){
        return this.workers.some(merchant => !merchant.busy);
    }
    trade(marketSeller){
        const villageBuyer = this.getBuildingVillage().village;
        const marketBuyer = this;
        const villageSeller = marketSeller.getBuildingVillage().village;
        const transportUnit = this.workers.find(merchant => !merchant.busy); // Sélection d'unité disponible
        if (!transportUnit) return;
        transportUnit.busy = true;

        completeTheTransaction(villageBuyer, marketBuyer, villageSeller, marketSeller, transportUnit);

        setTimeout(() => {
            const warehouse = villageBuyer.amenagements.find(a => a.type === "warehouse");
            transportUnit?.cargo?.stock.forEach(resource => {
                warehouse.addToStock(resource.type, resource.quantity);
            });
            transportUnit?.clearCargo(); // Vide le cargo et réinitialise l'état du transport
            transportUnit.busy = false;
            transportUnit.gainExperience(0.05); // L'unité prend de l'expérience
            this.buildingGainExperience(0.05); // Le bâtiment prend de l'expérience

            const dockyard = this.getBuildingVillage().dockyard;
            const shipyard = this.getBuildingVillage().shipyard;

            // Si dockyard, si shipyard vérification disponibilité de ressources requises
            if(dockyard && dockyard.workers.length > 0) dockyard.checkSupplies();
            if(shipyard && shipyard.workers.length > 0) shipyard.checkSupplies();

        }, 5000);
    }
    // Vérification et détruction des ordres de vente expirés
    cleanExpiredOrders() {
        const currentTime = Date.now();
        this.buyOrders = this.buyOrders.filter(order => {
            const isExpired = (currentTime - order.timestamp) > this.expirationTime;
            return !isExpired || order.buyFrom !== null;
        });
        this.sellOrders = this.sellOrders.filter(order => {
            const isExpired = (currentTime - order.timestamp) > this.expirationTime;
            return !isExpired || order.soldTo !== null;
        });
    }

    updatePrices() {
        const village = this.getBuildingVillage().village;
        let supply = {};
        let demand = {};

        const nearbyMarketsFactor = findNearbyMarket(village, true);
        nearbyMarketsFactor.forEach(market => {
            // Calcule de l'offre et de la demande
            market.sellOrders.forEach(order => {
                supply[order.type] = (supply[order.type] || 0) + order.quantity;
            });
    
            market.buyOrders.forEach(order => {
                demand[order.type] = (demand[order.type] || 0) + order.quantity;
            });

        });

        // Ajuste les prix
        Object.keys(basePrices).forEach(resource => {
            let supplyQty = supply[resource] || 0;
            let demandQty = demand[resource] || 0;
            let stockQty = this.pickFromStorage(resource, null, "quantity") || 0;

            if (!this.pickFromStorage(resource, null, "check")) return;

            let updatedPrice = Math.ceil(basePrices[resource]);

            if (stableResources.includes(resource)) {

                if (demandQty > (supplyQty + stockQty)) {
                    updatedPrice = Math.min(
                        Math.ceil(basePrices[resource] * (1 + ((demandQty - (supplyQty + stockQty)) / 100))),
                        Math.ceil(basePrices[resource] * 1.15) // Prix max, +15% prix de base
                    );
                } else if ((supplyQty + stockQty) > demandQty) {
                    updatedPrice = Math.max(
                        Math.ceil(basePrices[resource] * (1 - (((supplyQty + stockQty) - demandQty) / 100))),
                        Math.ceil(basePrices[resource] * 0.9) // Prix min, -10% prix de base
                    );
                }
                
            }else{

                if (demandQty > (supplyQty + stockQty)) {
                    updatedPrice = Math.min(
                        Math.ceil(basePrices[resource] * (1 + ((demandQty - (supplyQty + stockQty)) / 100))),
                        Math.ceil(basePrices[resource] * 2)  // Prix max, 100% (2x) prix de base
                    );
                } else if ((supplyQty + stockQty) > demandQty) {
                    updatedPrice = Math.max(
                        Math.ceil(basePrices[resource] * (1 - (((supplyQty + stockQty) - demandQty) / 100))),
                        Math.ceil(basePrices[resource] * 0.5) // Prix min, 50% (0.5x) prix de base
                    );
                }

            }
            
            this.priceFluctuation[resource] = Math.ceil(this.priceFluctuation[resource] * 0.8) + Math.ceil(updatedPrice * 0.2);
        });
        // console.log(`${village.name} Updated Prices: ${JSON.stringify(this.priceFluctuation)}`);
    }

    getPrice(resourceType) {
        return this.priceFluctuation[resourceType] || basePrices[resourceType];
    }
    // Fonction principale pour maintenir le marché
    maintainMarket() {
        this.cleanExpiredOrders(); // Suppression des ordres expirés
        this.evaluateMarketsNeeds(()=>{
            this.planPurchases();
            this.updatePrices();
        })
    }
}