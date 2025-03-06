
class Workers{
    constructor(data) {
        this.id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        this.villageID = data.villageID;
        this.type = data.type; // Type de travailleur (mineur, fermier, etc.)
        this.buildingID = data.buildingID;
        this.workPlaceType = data.workPlace;
        this.level = data.level; // Niveau du travailleur
        this.laborforce = this.calculateLaborforce(); // Force de travail
        this.consumption = this.calculateConsumption();
        this.happiness = 60; 
        this.experience = 0;
    }
    calculateConsumption(){
        return workersConsumption[this.type];
    }
    calculateLaborforce() {
        const baseLabor = 1.15; // Force de travail de base
        const levelBonus = { 1: 1, 2: 1.5, 3: 2 }; // Bonus selon le niveau
        return baseLabor * (levelBonus[this.level] || 1);
    }
    gainExperience(amount) {
        this.experience += amount;
        if (this.experience >= this.getLevelUpThreshold() && this.level < 3) {
            this.levelUp();
        }
    }
    getLevelUpThreshold() {
        return this.level * 150;
    }
    levelUp() {
        this.level += 1;
        this.laborforce = this.calculateLaborforce(); // Met à jour la force de travail
        const newType = buildingWorkersLevel[this.workPlaceType]?.find( w => w.level === this.level )?.workerType;
        this.type = newType;
        this.calculateLaborforce();
        this.consumption = this.calculateConsumption();
    }
}