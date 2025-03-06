
function generateVillages(island) {
    if (island.landPos.length <= 0) return;
    const excludedBeachTypes = ['beach-4 nord', 'beach-4 sud', 'beach-4 est', 'beach-4 ouest',
    'river-1 nord', 'river-1 sud', 'river-1 est', 'river-1 ouest',
    'river-2 nord', 'river-2 sud', 'river-2 est', 'river-2 ouest',
    'river-3 nord', 'river-3 sud', 'river-3 est', 'river-3 ouest',
    'river-4 nord', 'river-4 sud', 'river-4 est', 'river-4 ouest',
    'corner-out-1']; //, 'hill', 'mountain', 'plain'
    const islandVillages = [];
    const availableCells = [...island.beaches.filter(beach => !excludedBeachTypes.includes(beach.type) )];

    let maxVillage = Math.floor(availableCells.length/5);
    let firstVillage = true;
    while (maxVillage > 0 ) {
        const {x, y, type, islandID} = availableCells[Math.floor(Math.random() * availableCells.length)];
        const villageID = `${x}-${y}`;
        let villageType = firstVillage ? "capitale " : "";
        firstVillage = false;
        villageType += (type != "plain") ? "cotiere" : "interieur";
        let villageLevel = 1;
        if (isFarEnough(x, y, islandVillages, minDistance = 1)) {
            const village = new Villages(getRandomName(), x, y, villageType, villageLevel, villageID, islandID, type);
            villages.push(village);
            village.assignNearbyResources(island);
            islandVillages.push(village);
        }
        maxVillage--;
    }
    
    return islandVillages;
}


        