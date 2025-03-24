
class Warehouses extends Buildings {
    constructor(data) {
        super(data);
        this.capacity = this.calculateCapacity();
        this.foodQuota = 0.1; // Réserve minimum pour "food" (10%)
    }
    calculateCapacity() {
        return this.level * 2000;
    }
    addToStock(resourceType, quantity) {
        const totalCapacity = this.calculateCapacity();
        const foodQuota = Math.floor(totalCapacity * this.foodQuota); // Capacité réservée pour "food"
        const nonFoodQuota = totalCapacity - foodQuota; // Capacité réservée pour les autres ressources

        const foodStock = this.stock.find(item => item.type === "food")?.quantity || 0;
        const nonFoodStock = this.stock.reduce((sum, item) => (item.type !== "food" ? sum + item.quantity : sum), 0);
        const freeSpace = totalCapacity - this.stock.reduce((sum, item) => sum + item.quantity, 0);

        if (resourceType === "food") {
            // Ajouter de la nourriture, en priorité
            const maxFoodSpace = foodQuota - foodStock;
            const qtyToAdd = Math.min(quantity, maxFoodSpace, freeSpace);
            this.updateStock(resourceType, qtyToAdd);
        } else {
            // Ajouter d'autres resources
            const maxNonFoodSpace = nonFoodQuota - nonFoodStock;
            const qtyToAdd = Math.min(quantity, maxNonFoodSpace, freeSpace);
            this.updateStock(resourceType, qtyToAdd);
        }
        this.buildingGainExperience(0.01);
    }
    foodQuotaCap(){
        const totalCapacity = this.calculateCapacity();
        const foodQuota = Math.floor(totalCapacity * this.foodQuota);

        return foodQuota;
    }
    dynamicCap(){
        const totalCapacity = this.calculateCapacity();
        const nonFoodSpace = totalCapacity - this.foodQuotaCap();
        const elementInStock = this.stock.length || 1;
        const dynamicCap = Math.floor(nonFoodSpace / elementInStock) - 10;

        return dynamicCap;
    }
    canProduct(resourceType){
        const resourceStock = this.pickFromStorage(resourceType, null, "quantity") || 0;
        const dynamicCap = this.dynamicCap();

        return dynamicCap > resourceStock;
    }
    canProductFood(){
        const resourceStock = this.pickFromStorage("food", null, "quantity") || 0;

        return this.foodQuotaCap() > resourceStock;
    }
    updateStock(resourceType, quantity) {
        const existingResource = this.stock.find(item => item.type === resourceType);
        if (quantity > 0) {
            if (existingResource) {
                existingResource.quantity += quantity;
                updateWarehouseResources(this.villageID, existingResource.stockId, existingResource.quantity);
            } else {
                let stockId = `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
                this.stock.push({ stockId, type: resourceType, quantity });
                newWarehouseResources(this.villageID, stockId, resourceType, quantity)
            }
        }
    }
    upgrade() {
        super.upgrade();
        this.capacity = this.calculateCapacity();
    }
}