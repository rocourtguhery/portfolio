$(document).on("click",`.buildings-btn`, function() {
    const villageId = $(this).parents(`#village-management`).attr(`villageId`);
    const village = villages.find(village => village.id === villageId);
    const parents = $(this).parents(`#village-management-box.village-${villageId}`);
    parents.find(`.display-village-components`).fadeOut(100).remove();
    displayAmenagementsBuildings(village);
    parents.find(`.amenagements-view`).fadeIn(100).css({
        display: 'flex'
    });
});

$(document).on("click",`.townhall-btn`, function() {
    const villageId = $(this).parents(`#village-management`).attr(`villageId`);
    const village = villages.find(village => village.id === villageId);
    const parents = $(this).parents(`#village-management-box.village-${villageId}`);
    parents.find(`.display-village-components`).fadeOut(100).remove();
    displayTownhall(village);
    parents.find(`.townhall-view`).fadeIn(100).css({
        display: 'flex'
    });
});
$(document).on("click",`.amenagements-view .worker-img .workers-type-option .workers-type-minus`, function(e) {
    // Enlever un travailleur d'un amenagement
    const $this = $(this);
    const parents = $this.parents(`.building`);
    const buildingId = parents.attr("data-buildingid");
    const villageId = parents.attr("data-buildingvillageid");
    const village = villages.find(village => village.id === villageId);
    const building = village.amenagements.find(building => building.id === buildingId);
    const workerType = $this.parents(`.worker`).attr("data-workertype");

    const workerIndex = building.workers.findIndex(worker => worker.type === workerType);
    if (workerIndex !== -1) {
        const worker = building.workers.splice(workerIndex, 1)[0]; // Stock le worker trouvé
        worker.workPlaceType = null;
        worker.buildingID = null;
        if (!building.workers.some(worker => worker.type === workerType)) {
            $this.parents(`.worker`).fadeOut(100).remove();
        }
        displayBuildingWorkers(building);
        displayBuildingProduction(building);
    }
    e.stopPropagation(); 
});
$(document).on("click",`.amenagements-view .add-worker`, function() {
    // Ajouter un travailleur dans un amenagement
    const $this = $(this);
    const parents = $this.parents(`.building`);
    const buildingId = parents.attr("data-buildingid");
    const villageId = parents.attr("data-buildingvillageid");
    const village = villages.find(village => village.id === villageId);
    const building = village.amenagements.find(building => building.id === buildingId);
    const unemployed = village.workers.filter(worker => !worker.workPlaceType || !worker.buildingID);
    if (unemployed.length <= 0) {
        const msg = $this.parents(`.village-buildings`).find(`.msg`);
        msg.empty().text(`Aucun sans emploi disponible!`).fadeIn(50,()=>{
            setTimeout(() => {
                msg.fadeOut(50);
            }, 2500);
        });
        return;
    }
    village.assignWorker(building, unemployed);
    displayBuildingWorkers(building);
    displayBuildingProduction(building);
});
$(document).on("click",`.amenagements-view .worker-img`, function() {
    const $this = $(this);
    const parents = $this.parents(`.building`);
    const buildingId = parents.attr("data-buildingid");
    const villageId = parents.attr("data-buildingvillageid");
    const village = villages.find(village => village.id === villageId);
    const building = village.amenagements.find(building => building.id === buildingId);
    const workerType = $this.parents(`.worker`).attr("data-workertype");
    const showBuildingWorkersDiv = document.createElement('div');
    showBuildingWorkersDiv.className = `village-buildings-show-workers`;
    showBuildingWorkersDiv.innerHTML = showBuildingWorkers(building, workerType);
    showBuildingWorkersDiv.dataset.villageid = villageId;

    const backdropClone = document.querySelector(`.village-${villageId} #village-management-drop`).cloneNode(true);
    backdropClone.setAttribute(`id`,`backdropClone`);
    $(`.village-${villageId} #village-management > div:not(#village-management-drop)`).fadeOut(50);
    document.querySelector(`.village-${villageId} #village-management`).append(backdropClone, showBuildingWorkersDiv);

});
$(document).on("click",`.close-show-bBuilding-workers`, function() {
    const $this = $(this);
    const parent = $this.parents(`.village-buildings-show-workers`);
    const villageId = parent.attr("data-villageid");
    parent.fadeOut(150).remove();
    $(`.village-${villageId} #backdropClone`).fadeOut(150).remove();
    $(`.village-${villageId} #village-management > div`).fadeIn(250);
});
$(document).on("click",`.upgrade-btn`, function() {
    const $this = $(this);
    const parents = $this.parents(`.building`);
    const buildingId = parents.attr("data-buildingid");
    const villageId = parents.attr("data-buildingvillageid");
    const village = villages.find(village => village.id === villageId);
    const building = village.amenagements.find(building => building.id === buildingId);
    const market = building.getBuildingVillage().market;
    const hasInsufficientPopulation = village.workers.length < (building.level / 0.25) + building.minPopulation;
    if (hasInsufficientPopulation ){
        const msg = $this.parents(`.village-buildings .village-workshops`).find(`.msg`);
        msg.empty().text(`Démographie insuffisantes!`).fadeIn(50,()=>{
            setTimeout(() => {
                msg.fadeOut(50);
            }, 2500);
        });
        return;
    };
    const pourcentageProgress = (building.nextLevelProgress * 100) / building.getLevelUpThreshold();
    const updatedCost = building.calculateCostForNextLevel();
    const goldCost = calculatePrice(updatedCost, market) * ((100 - pourcentageProgress) + 1);
});

function displayAmenagementsBuildings(village){
    const fragment = document.createDocumentFragment();
    const amenagements = village.amenagements.filter(a => a.category === "amenagement");
    const workshops = village.amenagements.filter(a => a.category === "workshop");
    const buildingsBox = document.createElement('div');
    buildingsBox.className = `amenagements-view display-village-components`;

    const villageBuildings = document.createElement('div');
    villageBuildings.className = `village-buildings`;
    
        const amenagementsDiv = document.createElement('div');
        amenagementsDiv.className = `village-amenagements`;
        amenagementsDiv.innerHTML = `<h6 class="village-buildings-list-title">Amenagements</h6><span class="village-buildings-msg msg"></span><div class="village-amenagements-list"></div>`;
        
        villageBuildings.appendChild(amenagementsDiv);
    
        const workshopsDiv = document.createElement('div');
        workshopsDiv.className = `village-workshops`;
        workshopsDiv.innerHTML = `<h6 class="village-buildings-list-title">Ateliers</h6><span class="village-buildings-msg msg"></span><div class="village-workshops-list"></div>`;
        
        villageBuildings.appendChild(workshopsDiv);

        buildingsBox.appendChild(villageBuildings);
    fragment.appendChild(buildingsBox);
    document.querySelector('#buildings-box').appendChild(fragment);

    amenagements.forEach(building => {
        amenagementsBuilding(building);
    });
    workshops.forEach(building => {
        amenagementsBuilding(building);
    });
}

function amenagementsBuilding(building) {
    const villageId = building.getBuildingVillage().id;
    let targetClass = `village-amenagements-list`;
    if (building.category === `workshop`) {
        targetClass = `village-workshops-list`;
    }
    const listDiv = document.querySelector(`.village-${villageId} .amenagements-view .village-buildings .${targetClass}`);
    if (!listDiv) return;
    
    const pourcentageProgress = (building.nextLevelProgress * 100) / building.getLevelUpThreshold();

    const buildingDiv = document.createElement('div');
    buildingDiv.id = `building-${building.id}`;
    buildingDiv.className = `building building-${building.type} ${building.category} level-${building.level}`;
    buildingDiv.dataset.buildingid = `${building.id}`;
    buildingDiv.dataset.buildingvillageid = `${building.villageID}`;

    let html = `<div class="building-header">`;
            html += `<div class="building-type-name building-name">`;
                const resource = building.resource && ["mine", "farm"].includes(building.type)? 
                                ` de ${ressourceFrName(building.resource.type)||""}`: ``;
                html += `<span class="name-level">${amenagementFrName(building.type)||""} ${resource}`;
                    html += `<span class="building-level">Lv. ${building.level}</span>`;
                html += `</span>`;
                html += `<div class="building-nextLevelProgress"><div class="levelProgress"></div></div>`;
            html += `</div>`;

            html += `<div class="building-img building-${building.type}"></div>`;

            html += `<span class="max-worker"></span>`;
            
            html += `<div class="building-workers workers"></div>`;

        html += `</div>`;

        html += `<div class="building-production production"></div>`;

    buildingDiv.innerHTML = html;
    
    listDiv.appendChild(buildingDiv);
    displayBuildingWorkers(building);
    displayBuildingProduction(building);
    upgradeBuildingcheck(building, pourcentageProgress);
}

function displayBuildingWorkers(building) {
    const WorkersGroup = Object.groupBy(building.workers, ({ type }) => type);
    const WorkersByType = Object.fromEntries(
        Object.entries(WorkersGroup).map(([key, value]) => [key, value.length])
    );
    const buildingWorkers = document.querySelector(`#building-${building.id} .building-workers.workers`);
    buildingWorkers.innerHTML = "";
    const buildingWorkersMax = document.querySelector(`#building-${building.id} .max-worker`);
    buildingWorkersMax.innerHTML = "";
    Object.entries(WorkersByType).forEach(([key, value]) =>{
        let html = ``; 
        const WorkerDiv = document.createElement('div');
        WorkerDiv.className = "worker";
        WorkerDiv.dataset.workertype = `${key}`;

            html += `<div class="worker-img ${key}">`;
                html += `<div class="workers-type-option">`;
                    html += `<div class="workers-type-number" numWorker="${value}">x${value}</div>`;
                    html += `<div class="workers-type-minus"><i class='far fa-minus-square'></i></div>`;
                html += `</div>`;
            html += `</div>`;
            html += `<span class="info-text" style="color:#333;">${workersFrType(key)}</span>`;
            WorkerDiv.innerHTML = html;
        buildingWorkers.appendChild(WorkerDiv);
    });
    if (building.workers.length >= building.maxLabors) {
        buildingWorkersMax.innerHTML = `<span class="total-workers">${building.workers.length}/${building.maxLabors}</span>`;
        return;
    }
    buildingWorkersMax.innerHTML = `<span class="total-workers">${building.workers.length}/${building.maxLabors}</span><span class="add-worker"><i class='far fa-plus-square'></i></span>`;
}
function displayBuildingProduction(building){
    const buildingProduction = document.querySelector(`#building-${building.id} .building-production.production`);
    buildingProduction.innerHTML = "";
    if (building.category === "amenagement") {
        let html = ``;
        html += `<div class="production-title">Production</div>`;
        html += `<div class="resource">${ressourceFrName(building?.resource.type)} :<span class="quantity">+${Math.floor(building.showBuildingProd().prod)}/j</span></div>`;
        const bonusFactor = building.showBuildingProd().bonus;
        html += `<div class="production-bonus-title">Bonus de production</div>`;
        html += `<div class="production-bonus">`;
        Object.entries(bonusFactor).forEach(([key, value])=>{
            html += `<span class="bonus-factor factor-${key}">${ressourceFrName(key) || amenagementFrName(key) || ""} : (${value})</span>`;
        })
        html += `</div>`;
        buildingProduction.innerHTML = html;
    }
    if (building.category === "workshop") {
        const productionOptions = workshopProduction[building.type];
        const production = building.calculateBuildingProduction();
        let html = ``;
        html += `<div class="production-title">Production de ${ressourceFrName(productionOptions[0].result.type)||""}</div>`;
        productionOptions.forEach(option => {
            if (building.level !== option.minLevel) return;
            const { type, quantity } = option.result;
            html += `<div class="production-option">`;
                html += `<div class="resource production-cost-list">`;
                    Object.entries(option.resources).forEach(([resource, quantity], index, arr) => {
                        html += `<div class="production-cost"><div class="cost-icon cost-${resource}"></div>x${quantity}<span  class="info-text" style="color:#333;">${quantity} ${ressourceFrName(resource)||""}</span></div>`;
                        if (arr.length > 1 && index !== (arr.length -1)) {
                            html += `<span class="production-cost-plus"> <i class='fas fa-plus'></i> </span>`;
                        }
                    })
                    html += `<i class='fas fa-long-arrow-alt-right'></i>`;
                    html += `<div class="quantity">`;
                    html += `<div class="production-result production-cost">`;
                    html += `${Math.round(quantity)} <div class="cost-icon cost-${type}"></div>`;
                    html += `<span  class="info-text" style="color:#333;">${ressourceFrName(type)||""}</span>`;
                    html += `</div>`;

                    html += `</div>`;
                html += `</div>`;
            html += `</div>`;
        })
        buildingProduction.innerHTML = html;
    }
}

function showBuildingWorkers(building, workerType){
    const workers = building.workers.filter(worker => worker.type === workerType);
    let html = `<div class="workers-list-type-name">${workersFrType(workerType)}<div class="btn-close close-show-bBuilding-workers"></div></div>`;
    html += `<div class="workers-list">`;
    workers.forEach(worker => {
        html += displayWorkerInfo(worker);
    });
    html += `</div>`;
    return html;
}

function upgradeBuildingcheck(building, pourcentageProgress){
    if (building.level >= 50) return;

    if (!document.querySelector(`#building-${building.id} .building-nextLevelProgress`)) return;
    const upgradeBtn = document.querySelector(`#building-${building.id} .building-nextLevelProgress .upgrade-btn`);
    if (pourcentageProgress >= 0 && !upgradeBtn) {
        const upgradeBtnDiv = document.createElement('div');
        upgradeBtnDiv.className = `upgrade-btn`;
        upgradeBtnDiv.innerHTML = `<i class="fas fa-level-up-alt"></i>`;
        document.querySelector(`#building-${building.id} .building-nextLevelProgress`).appendChild(upgradeBtnDiv);
    }
    document.querySelector(`#building-${building.id} .building-nextLevelProgress .levelProgress`).style.width = `${pourcentageProgress}%`;
}


