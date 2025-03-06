
class Merchants extends Workers {
    constructor(data) {
        super(data)
        // this.name = this.getMerchantName();
        this.cargo = this.calculateCargo(); // Initialisation de la capacité de stockage
        this.busy = false; 
        this.from = "";
        this.to = "";
    }
    calculateCargo() {
        return { capacity: this.level * 150, stock: [] };
    }

    getMerchantName(){
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
        this.cargo.stock = [];
        this.from = "-";
        this.to = "-";
    }
}