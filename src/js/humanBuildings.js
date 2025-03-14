$(document).on("click",`.buildings-btn`, function() {
    const villageId = $(this).parents(`#village-management`).attr("data-villageid");
    const village = villages.find(village => village.id === villageId);
    const parents = $(this).parents(`#village-management-box.village-${villageId}`);
    parents.find(`.display-village-components`).fadeOut(100).remove();
    displayAmenagementsBuildings(village);
    parents.find(`.amenagements-view`).fadeIn(100).css({
        display: 'flex'
    });
});

$(document).on("click",`.townhall-btn`, function() {
    const villageId = $(this).parents(`#village-management`).attr("data-villageid");
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
    const {building} = getThisBuilding($this);
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
    const {village, building} = getThisBuilding($this);

    const unemployed = village.workers.filter(worker => !worker.workPlaceType || !worker.buildingID);
    if (unemployed.length <= 0) {
        const msg = $this.parents(`.village-building-list`).siblings(`.msg`);
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
    const {village, building} = getThisBuilding($this);
    const villageId = village.id;
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
    const {village, building} = getThisBuilding($this);
    const market = building.getBuildingVillage().market;
    const hasInsufficientPopulation = village.workers.length < (building.level / 0.25) + building.minPopulation;
    if (hasInsufficientPopulation ){
        const msg = $this.parents(`.village-building-list`).siblings(`.msg`);
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
$(document).on("click",`.select-prod`, function() {
    const $this = $(this);
    const productionOptions = JSON.parse($this.attr("data-prodOptions"));
    const {building} = getThisBuilding($this);

    $(`.select-option-container`).fadeOut(250).remove();

    $this.parents(`.village-building-list`).addClass('no-Overflow-Scroll');

    let html = `<div class="select-option-container">`;
    html += `<div class="btn-close close-select-option"></div>`
    html += `<div class="select-option-header">Options</div>`;
        html += `<div class="production-option">`;
            html += `<ul>`;
            const options = productionOptions.filter(options => building.level >= options.minLevel);
            options.forEach(option => {
                // if (building.level < option.minLevel) return;
                const { type, quantity } = option.result;
                const isSelected = JSON.stringify(building.workshopProduction.resources) === JSON.stringify(option.resources);
                console.log(`isSelected : ${JSON.stringify(isSelected)}`);

                html += `<li class="resource production">`; //.production-cost-list
                    Object.entries(option.resources).forEach(([resource, quantity], index, arr) => {
                        html += `<div class="production-cost"><div class="cost-icon cost-${resource}"></div>x${quantity}<span  class="info-text" style="color:#333;">${quantity} ${ressourceFrName(resource)||""}</span></div>`;
                        if (arr.length > 1 && index !== (arr.length -1)) {
                            html += `<span class="production-cost-plus"> <i class='fas fa-plus'></i> </span>`;
                        }
                    })
                    html += `<i class='fas fa-long-arrow-alt-right'></i>`;
                    html += `<div class="production-result production-cost">`;
                        html += `<div class="cost-icon cost-${type}"></div>x${Math.round(quantity)}`;
                        html += `<span  class="info-text" style="color:#333;">${ressourceFrName(type)||""}</span>`;
                    html += `</div>`;
                    html += `<label class="prod-select">`;
                        html += `<input class="prodSelect" data-option='${JSON.stringify(option)}' ${isSelected?"checked":""} type="${options.length > 1 ? "radio" : "checkbox"}" name="prodSelect">`;
                        html += `<span class="input-checked"></span>`
                    html += `</label>`;
                html += `</li>`;
            })
            html += `</ul>`;
        html += `</div>`;
    html += `</div>`;
    
    $(`#building-${building.id} .building-production.production`).append(html);

});
$(document).on("click",`.close-select-option`, function() {
    const $this = $(this);
    $this.parents(`.village-building-list`).removeClass('no-Overflow-Scroll');
    const {building} = getThisBuilding($this);
    displayBuildingProduction(building);
    $this.parent().fadeOut(250).remove();
});
$(document).on("click",`.prodSelect`, function() {
    const $this = $(this);
    const {building} = getThisBuilding($this);
    const checked = $this.is(':checked');
    if (checked) {
        console.log( $(this).is(':checked'));
        const option = JSON.parse($this.attr("data-option"));
        building.workshopProduction = option;
    }else{
        building.workshopProduction = {};
    }
    console.log(`building.workshopProduction: ${JSON.stringify(building.workshopProduction)}`);
});
function displayAmenagementsBuildings(village){
    const fragment = document.createDocumentFragment();
    const amenagements = village.amenagements.filter(a => a.category === "amenagement");
    const workshops = village.amenagements.filter(a => a.category === "workshop");
    const buildingsBox = document.createElement('div');
    buildingsBox.className = `amenagements-view display-village-components`;

    const villageBuildings = document.createElement('div')
    villageBuildings.className = `village-buildings`;

    if (villageHasBuilding(village, false, "amenagement" )){
        const amenagementsDiv = document.createElement('div');
        amenagementsDiv.className = `village-amenagements`;
        amenagementsDiv.innerHTML = `<h6 class="village-buildings-list-title">Amenagements</h6><span class="village-buildings-msg msg"></span><div class="village-amenagements-list village-building-list"></div>`;
        
        villageBuildings.appendChild(amenagementsDiv);
    }

    if (villageHasBuilding(village, false, "workshop" )){
        const workshopsDiv = document.createElement('div');
        workshopsDiv.className = `village-workshops`;
        workshopsDiv.innerHTML = `<h6 class="village-buildings-list-title">Ateliers</h6><span class="village-buildings-msg msg"></span><div class="village-workshops-list village-building-list"></div>`;

        villageBuildings.appendChild(workshopsDiv);
    }

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
        const production = building.calculateBuildingProduction(false);
        let html = ``;
        const selectedProd = building.workshopProduction; // productionOptions.find(option => option.selected && building.level >= option.minLevel);
        if (Object.keys(selectedProd).length > 0) {
            html += `<div class="production-title"><span>Production</span> <span class="select-prod" data-prodOptions='${JSON.stringify(productionOptions)}'><i class='far fa-edit'></i></div></span></div>`; // de ${ressourceFrName(productionOptions[0].result.type)||""}
            const { type, quantity } = selectedProd.result;
            console.log(`selectedProd : ${JSON.stringify(selectedProd)}`);
            // selectedProd : {"resources":{"cotton":3},"minLevel":1,"result":{"type":"fabric","quantity":2.1},"selected":true}
            html += `<div class="production-option" >`;
                html += `<div class="resource production">`;
                    Object.entries(selectedProd.resources).forEach(([resource, quantity], index, arr) => {
                        html += `<div class="production-cost"><div class="cost-icon cost-${resource}"></div>x${quantity}<span class="info-text" style="color:#333;">${quantity} ${ressourceFrName(resource)||""}</span></div>`;
                        if (arr.length > 1 && index !== (arr.length -1)) {
                            html += `<span class="production-cost-plus"> <i class='fas fa-plus'></i> </span>`;
                        }
                    })
                    html += `<i class='fas fa-long-arrow-alt-right'></i>`;
                    html += `<div class="quantity">`;
                        html += `<div class="production-result production-cost">`;
                            html += `${Math.round(quantity)}<div class="cost-icon cost-${type}"></div>`;
                            html += `<span  class="info-text" style="color:#333;">${ressourceFrName(type)||""}</span>`;
                        html += `</div>`;
                        html += `x <span class="worker-labor" style="height: 22px;width: 22px;">${Math.round(production)} <i class="fas fa-hammer"></i> <span class="info-text" style="color:#333;">Force de Travail</span></span>`;
                    html += `</div>`;
                html += `</div>`;
            html += `</div>`;
        }else{
            html += `<div class="production-title"><span>Choisir la production.</span><span class="select-prod" data-prodOptions='${JSON.stringify(productionOptions)}'><i class='far fa-edit'></i></div></span>`;
        }
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


