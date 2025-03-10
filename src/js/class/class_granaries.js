
class Granaries extends Buildings {
    constructor(data) { 
        super(data);
        this.capacity = this.calculateCapacity();
        this.allowedResources = ["cereals","food"];
    }
    calculateCapacity() {
        return this.level * 1000;
    }
    addToStock(resourceType, quantity) {
        const totalCapacity = this.calculateCapacity();
        const existingResource = this.stock.find(item => item.type === resourceType);
        const freeSpace = totalCapacity - this.stock.reduce((sum, item) => sum + item.quantity, 0);
        const qtyToAdd = Math.min(quantity, freeSpace);
        const remains = quantity - qtyToAdd;

        if (existingResource) {
            existingResource.quantity += qtyToAdd;
        } else {
            this.stock.push({ type: resourceType, quantity: qtyToAdd });
        }
        this.buildingGainExperience(0.05);
    }
    upgrade() {
        super.upgrade();
        this.capacity = this.calculateCapacity();
    }
}