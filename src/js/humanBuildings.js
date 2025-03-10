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
$(document).on("click",`.amenagements-view .workers-type-minus`, function() {
    // Enlever un travailleur d'un amenagement
    const $this = $(this);
    const parents = $this.parents(`.building`);
    const buildingId = parents.attr("data-buildingid");
    const villageId = parents.attr("data-buildingvillageid");
    const village = villages.find(village => village.id === villageId);
    const building = village.amenagements.find(building => building.id === buildingId);
    const workerType = $this.attr("workerType");

    const workerIndex = building.workers.findIndex(worker => worker.type === workerType);
    if (workerIndex !== -1) {
        const worker = building.workers.splice(workerIndex, 1)[0]; // Retire et récupère le worker trouvé
        worker.workPlaceType = null;
        worker.buildingID = null;
        const numWorkerType = $this.parents(`.workers-type-option`).find(`.workers-type-number`);
        numWorkerType.attr("numWorker",`${(building.workers.length)}`);
        numWorkerType.text(`x${building.workers.length}`);
        parents.find(`.total-workers`).text(`${building.workers.length}/${building.maxLabors}`);
        if (!building.workers.some(worker => worker.type === workerType)) {
            $this.parents(`.worker`).fadeOut(100).remove();
        } 
    }
});

function displayAmenagementsBuildings(village){
    const fragment = document.createDocumentFragment();
    const amenagements = village.amenagements.filter(a => a.category === "amenagement");
    const workshops = village.amenagements.filter(a => a.category === "workshop");
    const buildingsBox = document.createElement('div');
    buildingsBox.className = `amenagements-view display-village-components`;

    const villageBuildings = document.createElement('div');
    villageBuildings.className = `village-buildings`;
    // if (amenagements && amenagements.length > 0) {
        const amenagementsDiv = document.createElement('div');
        amenagementsDiv.className = `village-amenagements`;
        amenagementsDiv.innerHTML = `<h6 class="village-buildings-list-title">Amenagements</h6><div class="village-amenagements-list"></div>`;
        /* amenagements.forEach(building => {
            amenagementsDiv.appendChild(amenagementsBuilding(building));
        }); */
        villageBuildings.appendChild(amenagementsDiv);
    /* }
    if (workshops && workshops.length > 0) { */
        const workshopsDiv = document.createElement('div');
        workshopsDiv.className = `village-workshops`;
        workshopsDiv.innerHTML = `<h6 class="village-buildings-list-title">Ateliers</h6><div class="village-workshops-list"></div>`;
        /* workshops.forEach(building => {
            workshopsDiv.appendChild(amenagementsBuilding(building));
        }); */
        villageBuildings.appendChild(workshopsDiv);
    // }
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
    const buildingDiv = document.createElement('div');
    buildingDiv.id = `${building.id}`;
    buildingDiv.className = `building building-${building.type} ${building.category} level-${building.level}`;
    buildingDiv.dataset.buildingid = `${building.id}`;
    buildingDiv.dataset.buildingvillageid = `${building.villageID}`;

    const WorkersGroup = Object.groupBy(building.workers, ({ type }) => type);
    const WorkersByType = Object.fromEntries(
        Object.entries(WorkersGroup).map(([key, value]) => [key, value.length])
    )
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

            html += `<span class="max-worker"><span class="total-workers">${building.workers.length}/${building.maxLabors}</span><span class="add-worker"><i class='far fa-plus-square'></i></span></span>`;
            html += `<div class="building-workers workers">`;
                html += displayBuildingWorkes(WorkersByType);
            html += `</div>`;

        html += `</div>`;

        html += `<div class="building-production production">`;
            html += displayBuildingProduction(building);
        html += `</div>`;

    buildingDiv.innerHTML = html;
    
    document.querySelector('.amenagements-view .village-buildings .village-amenagements-list').appendChild(buildingDiv);
    // return buildingDiv;
}

function displayBuildingWorkes(WorkersByType) {
    let html = ``; 
    Object.entries(WorkersByType).forEach(([key, value]) =>{
        html += `<div class="worker">`;
            html += `<div class="worker-img ${key}">`; //x${value}
                html += `<div class="workers-type-option">`;
                    html += `<div class="workers-type-number" numWorker="${value}">x${value}</div>`;
                    html += `<div class="workers-type-minus" workerType="${key}"><i class='far fa-minus-square'></i></div>`;
                html += `</div>`;
            html += `</div>`;
            html += `<span class="info-text" style="color:#333;">${workersFrType(key)}</span>`;
        html += `</div>`;
    });

    return html;
}
function displayBuildingProduction(building){
    let html = ``; 
    if (building.category === "amenagement") {
        html += `<div class="production-title">Production</div>`;
        html += `<div class="resource">${ressourceFrName(building?.resource.type)} :<span class="quantity">+${Math.floor(building.showBuildingProd().prod)}/j</span></div>`;
        const bonusFactor = building.showBuildingProd().bonus;
        html += `<div class="production-bonus-title">Bonus de production</div>`;
        html += `<div class="production-bonus">`;
        Object.entries(bonusFactor).forEach(([key, value])=>{
            html += `<span class="bonus-factor factor-${key}">${ressourceFrName(key) || amenagementFrName(key) || ""} : (${value})</span>`;
        })
        html += `</div>`;
    }
    return html;
}


