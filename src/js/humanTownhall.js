$(document).ready(function () {
    $(document).on("click",`.village`, function() {
        const $this = $(this);
        const villageId = $this.attr("id").split("-")[1].replace("x", "-");
        $("#game-box .mapCase").fadeTo(20, 0);
        $("#islandsOption-backdrop").fadeTo(250, 0.7);
        let html = `<div id="village-management-box" class="village-${villageId}">`;
        html += `<div id="village-management" data-villageid="${villageId}">`;
            html += `<div id="village-management-drop"></div>`;
            html += `<div class="btn-close close-page"></div>`;
        html += `</div>`;
        
        html += `</div>`;
        $("#game-box").after(html);
        $("#mini-map").fadeOut(150);
        $("#backToHome").fadeOut(150);
        displayVillage(villageId);
    });
    $(document).on("click",`#village-management .btn-close.close-page`, function() {
        $("#game-box .mapCase").fadeTo(250, 1);
        $("#islandsOption-backdrop").fadeTo(500, 0).fadeOut(500);
        $("#village-management-box").fadeOut(500).remove();
        $("#mini-map").fadeIn(500);
        $("#backToHome").fadeIn(500);
    });
    $(document).on("click",`#village-name-banner`, function() {
        $("#village-name").fadeOut(50, ()=>{
            const theInput = $("#edit-village-name").show(50).focus().val("").val($("#village-name").text());
        });
    });
    
    /* $(document).on("mouseenter","#village-info .population, #village-info .building, #village-info .happiness, #village-info .currency", function() {
        $(this).find(".info-text").fadeIn(100);
    });
    $(document).on("mouseleave","#village-info .population, #village-info .building, #village-info .happiness, #village-info .currency", function(e) {
        $(this).find(".info-text").fadeOut(100);
    }); */
    $(document).on("click",`.buildings-box-btn`, function() {
        if($(this).hasClass("active")) return;
        $(".buildings-box-btn").animate({
            backgroundPositionX: "20px"
        },50 ).removeClass("active");
        $(this).animate({
            backgroundPositionX: "0px"
        },50 ,()=>{
            $(this).addClass("active");
        });
    });
    
    let activeWorker = 0;
    let workerLeft = 0;
    $(document).on("click","#worker-prev", function() {
        if (activeWorker > 0) {
            $(this).removeClass("disabled");
            activeWorker--;
            workerLeft += 81;
            $(`#new-workers-box .worker`).removeClass("first-free-worker");
            $(`#new-workers-box .worker`).eq(activeWorker).addClass("first-free-worker");
            $("#new-workers-box").animate({
                left: `${workerLeft}px`,
            },()=>{
            });
        }
        if (activeWorker <= 0) {
            $(this).addClass("disabled");
        }
        if (activeWorker < $(`#new-workers-box .worker`).length - 3 ) {
            $("#worker-next").removeClass("disabled");
        }
    });
    $(document).on("click","#worker-next", function() {
        if (activeWorker < $(`#new-workers-box .worker`).length - 3 ) {
            $(this).removeClass("disabled");
            activeWorker++;
            workerLeft -= 81;
            $(`#new-workers-box .worker`).removeClass("first-free-worker");
            $(`#new-workers-box .worker`).eq(activeWorker).addClass("first-free-worker");
            $("#new-workers-box").animate({
                left: `${workerLeft}px`,
            },()=>{
            });
        }
        if (activeWorker > 0) {
            $("#worker-prev").removeClass("disabled");
        }
        if (activeWorker >= $(`#new-workers-box .worker`).length - 3 ) {
            $(this).addClass("disabled");
        }
    });
    $(document).on("click",`.show-worker-info`, function() {
        const info = $(this);
        $(".assign-worker-buildings").fadeOut(50).remove();
        $(".worker-info").fadeOut(50);
        const worker = JSON.parse(info.parents(`.worker-info-option`).attr("data-worker"));
        const townhallBox = info.parents(`#townhall-box-1`);
        townhallBox.append(displayWorkerInfo(worker));
        townhallBox.find(".worker-info").fadeIn(250).css({
            display: "flex"
        });
    });
    $(document).on("click",`.worker-info .close-worker-info`, function() {
        $(".worker-info").fadeOut(50).remove();
    });
    $(document).on("click",`.assign-worker`, function() {
        const assign = $(this);
        const villageId = assign.parents(".worker").attr("data-villageid");
        const worker = JSON.parse(assign.parents(`.worker-info-option`).attr("data-worker"));
        $(".worker-info").fadeOut(50).remove();
        $(".assign-worker-buildings").fadeOut(50).remove();
        
        const village = villages.find(village => village.id === villageId);
        displayAssignWorker(village, worker);
        
    });
    $(document).on("click",`.assign-worker-buildings .close-assign-worker`, function() {
        $(this).parents("#townhall-box-1").find(".assign-worker-buildings").fadeOut(50).remove();
    });
    $(document).on("click",`.assign-worker-buildings .batiment-box`, function(e) {
        e.preventDefault();
        const $this = $(this);
        $this.find(".batiment-icon").addClass("batiment-box-click");
        const buildingID = $this.attr("buildingId");
        const buildingType = $this.attr("type");
        const workerID = $this.parents(".assign-worker-buildings").attr("workerId");

        const building = buildings.find(b => b.id === buildingID);
        const village = building.getBuildingVillage().village;
        const worker = village.workers.find(w => w.id === workerID);
        const workerType = buildingWorkersLevel[buildingType]?.find(
            w => w.level === 1
        )?.workerType;
        worker.type = workerType;
        worker.buildingID = buildingID;
        worker.workPlaceType = buildingType;
        building.workers.push(worker);
        building.labors += worker.laborforce;
        $(`[buildingId=${buildingID}]`).find(".totalWorkers").empty().append(`(${building.workers.length}/${building.maxLabors})`);
        $this.find(".batiment-icon").removeClass("batiment-box-click");
        $(`#worker-${workerID}`).fadeOut(550).remove();
        $(`#assign-worker-${workerID}`).fadeOut(550).remove();

        const unemployed = village.workers.filter(worker => !worker.workPlaceType);
        if (unemployed.length <= 3) {
            $(`.village-${village.id} #prev-next-btn-box`).remove();
        }

        $this.prop('disabled', true);
    });
    $(document).on("click",`.planConstruction-show-info`, function() {
        const $this = $(this);
        $(".building-planConstruction-info").fadeOut(50);
        $this.parents(".building-planConstruction-box").find(".building-planConstruction-info").fadeIn(250);
    });
    $(document).on("click",`.close-building-planConstruction-info`, function() {
        const $this = $(this);
        $(".building-planConstruction-info").fadeOut(50);
    });
    $(document).on("click",`.planConstruction-addToQueue`, function(e) {
        e.preventDefault();
        const $this = $(this);
        if($this.parents(".building-planConstruction-box").hasClass("pakobos")) return;
        const {building, villageId, priority} = $this.data();
        const village = villages.find(village => village.id === villageId);

        addBuildingToQueue(village, building, priority);

        displayConstructionQueue(village, `#constructionQueue-list`);

        $this.parents(".building-planConstruction-box").fadeOut(250).remove();
        $this.prop('disabled', true);
    });
    $(document).on("mouseenter",`#constructionQueue-list .endTime`, function(e) {
        const $this = $(this);
        displayConstructionTimeLeft($this);
        setInterval(() => {
            displayConstructionTimeLeft($this)
        }, 1000)
    });
    function displayConstructionTimeLeft($this){
        const statTime = parseInt($this.attr("statTime"));
        const constructionTime = parseInt($this.attr("constructionTime"));
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - statTime) / 1000);
        const remainingTime = Math.max(constructionTime - elapsedTime, 0);
        $this.find(".info-text").empty().text(formatTimeRemaining(remainingTime));
    }

});

function displayVillage(villageId){
    const village = villages.find(village => village.id === villageId);
    $("#village-management").append(`<div id="village-name-banner-box"><div id="village-name-banner"><span id="village-name">${village.name}</span><input id="edit-village-name" type="text" maxLength="18" value="${village.name}" ></div></div>`);
    
    let header = `<div id="village-info">`;
        header += `<div class="population"><span id="village-info-population"></span> <span class="info-text">Populations</span> </div>`;
        header += `<div class="building"><span id="village-info-building"></span> <span class="info-text">Bâtiments</span> </div>`;
        header += `<div class="happiness"><span id="village-info-happiness"></span> <span class="info-text">Bonheur</span> </div>`;//formatHappiness(happiness);
        header += `<div  id="village-info-gold" class="currency"></div>`;
    header += `</div>`;

    let body = `<div id="buildings-box">`;

        body += `<div id="buildings-box-tabs">`;
            body += `<div class="buildings-box-btn townhall-btn active"><span class="info-text">${amenagementFrName("townhall")||""}</span></div>`;
            body += `<div class="buildings-box-btn productions-btn"><span class="info-text">Productions</span></div>`;
            body += `<div class="buildings-box-btn market-btn"><span class="info-text">${amenagementFrName("market")||""} | interface en dev</span></div>`;
            body += `<div class="buildings-box-btn port-btn"><span class="info-text">${amenagementFrName("port")||""} | interface en dev</span></div>`;
        body += `</div>`;
    body += `</div>`;

    $("#village-name-banner-box").append(header);
    $("#village-management").append(body);
    showTabsBtn(village);
    displayVillageInfo(village);
    displayTownhall(village);

    $(document).on("keyup",`#edit-village-name`, function(event) {
        if (event.keyCode === 13) {
            village.name = event.target.value;
            const villageId = $(this).parents("#village-management").attr("data-villageid");
            $(`#village-${villageId}`).find(".village-name").text(village.name);
            $("input[type=text]#edit-village-name").val(event.target.value);
            $("#village-name").text(village.name);
            $("#edit-village-name").fadeOut(50, ()=>{
                $("#village-name").fadeIn(50, ()=>{
                    setTimeout(() => {
                        resizeName();
                    }, 100);
                });
            });
        }
    });
    $(document).on("blur",`#edit-village-name`, function(event) {
        village.name = event.target.value;
        const villageId = $(this).parents("#village-management").attr("data-villageid");
        $(`#village-${villageId}`).find(".village-name").text(village.name);
        $("input[type=text]#edit-village-name").val(event.target.value);
        $("#village-name").text(village.name);
        $("#edit-village-name").fadeOut(50, ()=>{
            $("#village-name").fadeIn(50, ()=>{
                setTimeout(() => {
                    resizeName();
                }, 100);
            });
        });
    });
    resizeName();
}
function displayTownhall(village) {
    let body = `<div class="townhall-view display-village-components">`;
        body += `<div id="townhall-box-1">`;
            body += `<div class="townhall-img"><div class="townhall-management"><i class='fas fa-landmark'></i></div></div>`;
            body += `<div class="resource-catalog"></div>`;
            body += `<div id="new-workers-box"></div>`;
        body += `</div>`;
        body += `<div id="townhall-view-warehouse"></div>`;
        body += `<div id="planConstruction-view">`;
            body += `<div id="planConstruction-view-header">Construction</div>`;
            body += `<div id="planConstruction-building-list"></div>`;
        body += `</div>`;
        body += `<div id="constructionQueue">`;
            body += `<div id="constructionQueue-header">Chantier</div>`;
            body += `<div id="constructionQueue-list"></div>`;
        body += `</div>`;
    body += `</div>`;
    $("#buildings-box").append(body);

    const resources = village.resources.filter(res => res.discovered);
    const unemployeds = village.workers.filter(worker => !worker.workPlaceType && !worker.buildingID );

    displayResources(village, resources);
    displayWorkers(unemployeds, village, `#new-workers-box`);
    displayWarehouse(village);

    displayConstructionQueue(village, `#constructionQueue-list`);
    displayPlanConstructionBuildings(village);
    $(".townhall-view").fadeIn().css({
        display: 'flex'
    });
}
function displayVillageInfo(village){
    const totalHabitant = village.workers.length;
    const totalAmenagements = village.amenagements.length;
    const happiness = village.getAverageHappiness();
    const totalGold = village.gold;
    displayVillagePopulation(village.id, totalHabitant);
    displayVillageAmenagements(village.id, totalAmenagements);
    displayVillageHappiness(village.id, happiness);
    displayVillageGold(village.id, totalGold);
}

function displayWorkers(workers, village, selector){
    
        const amenagementsForWorkers = village.amenagements.filter(amenagement => !noNeedWorkersPlace.includes(amenagement.type) && amenagement.maxLabors > amenagement.workers.length);
        let html = ``;
            workers.forEach(worker => {
                html += `<div id="worker-${worker.id}" data-villageid="${village.id}" class="worker">`;
                    html += displayWorkerAvatarAndOption(worker, amenagementsForWorkers);
                html += `</div>`;
            });
        $(`.village-${village.id} ${selector}`).empty().append(html);
        $(`.village-${village.id} #prev-next-btn-box`).remove();
        if (workers.length > 3) {
            let btnBox = ``;
            btnBox += `<div id="prev-next-btn-box">`;
            btnBox += `<div id="worker-prev" class="prev-next-btn disabled"></div> <div id="worker-next" class="prev-next-btn"></div>`;
            btnBox += `</div>`;
            $(`.village-${village.id} #townhall-box-1`).append(btnBox);
        }
}
function displayWorkerAvatarAndOption(worker, amenagements){
    let html = `<div class="worker-img ${worker.type}">`;
            html +=`<span class="info-text">${workersFrType(worker.type)}</span>`;
            html += `<div class="worker-info-option" data-worker='${JSON.stringify(worker)}'>`;
                html += `<div class="show-worker-info"><i class='fas fa-info-circle'></i></div>`;
                html += (amenagements.length > 0)? `<div class="assign-worker"><i class='far fa-id-badge'></i></div>`: "";
            html += `</div>`;
        html += `</div>`;
    return html;
}
function displayWorkerInfo(worker){
    let html = `<div class="worker-info">`;
            html += `<div class="btn-close close-worker-info"></div>`;
            html += `<div class="worker-type">${workersFrType(worker.type)}</div>`;

            html += `<div class="worker-info-header">`;
                html += `<div class="worker-img ${worker.type}"></div>`;

                html += `<div class="happiness_labor">`;

                    html += `<div class="worker-happiness">${formatHappiness(worker.happiness)} <span class="indice">${worker.happiness}</span><span class="info-text">bonheur</span></div>`;
                    html += `<div class="worker-labor"><span class="labor-force"><i class='fas fa-hammer'></i></span><span class="indice">${parseFloat(worker.laborforce).toFixed(2)}</span><span class="info-text">Force de Travail</span></div>`;

                    html += `<div class="worker-consumption">`;
                        html += `<h6>Besoins</h6>`;
                        html += `${formatworkersConsumptions(worker.consumption)}`;
                    html += `</div>`;

                html += `</div>`;
            html += `</div>`;
            html += `<div class="worker-info-text"><h6><i class='fas fa-info-circle'></i></h6>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</div>`;
        html += `</div>`;
    return html;
}
function displayAssignWorker(village, worker){
    const amenagementsForWorkers = village.amenagements.filter(amenagement => !noNeedWorkersPlace.includes(amenagement.type) && amenagement.maxLabors > amenagement.workers.length);
    let html = `<div id="assign-worker-${worker.id}" class="assign-worker-buildings" workerId="${worker.id}" >`;
        html += `<div class="assign-worker-box-header">Affectations<div class="btn-close close-assign-worker"></div></div>`;
        amenagementsForWorkers.forEach(amenagement => {
            html += `<div buildingId="${amenagement.id}" type="${amenagement.type}" class="batiment-box ${amenagement.type}-box">`;
            html += `<div class="batiment-icon icon-${amenagement.type}">`;
            const resource = amenagement.resource && ["mine", "farm"].includes(amenagement.type)? ` de ${ressourceFrName(amenagement.resource.type)||""}`: ``;
            html += `${amenagementIcon(amenagement.type)} <div class="batiment-name">${amenagementFrName(amenagement.type)||""} ${resource}</div>`;
            html += `</div>`;
            html += `<span class="totalWorkers">(${amenagement.workers.length}/${amenagement.maxLabors})</span>`;
            html += `</div>`;
        });
        html += `</div>`;
    $(`.village-${village.id} #townhall-box-1`).append(html);
}
function displayResources(village, resources){
    let html = ``;
        resources.forEach(element => {
            html += `<div class="resource ${element.type}-box">`;
            html += `<div class="icon icon-${element.type}"></div>`;
            html += `<div class="resource-name">${mapRessourceFrName[element.type]}</div>`;
            html += `</div>`;
        });
    $(`.village-${village.id} #townhall-box-1 .resource-catalog`).empty().append(html);
}
function displayWarehouse(village){
    const warehouse = village.amenagements.find(building => building.type === "warehouse");
    const granary = village.amenagements.find(building => building.type === "granary");
    let html = `<div id="warehouse-view-header">Warehouse</div>`;
    if (granary) {
        granary?.stock.forEach(s => {
            html += `<div id="${s.stockId}" class="stock stock-${s.type} resource icon-${s.type}"><span class="stock-num">${Math.floor(s.quantity)}</span><span class="info-text">${ressourceFrName(s.type)||""}</span></div>`;
        });
    }
    warehouse?.stock.forEach(s => {
        html += `<div id="${s.stockId}" class="stock stock-${s.type} resource icon-${s.type}"><span class="stock-num">${Math.floor(s.quantity)}</span><span class="info-text">${ressourceFrName(s.type)||""}</span></div>`;
    });
    $(`.village-${village.id} #townhall-view-warehouse`).empty().append(html);
}
function displayPlanConstructionBuildings(village){
            
    const vId = $(`#village-management`).attr("data-villageid");
    const villageIdCheck = (village.id === vId);

    if (!villageIdCheck)  return;
        
    const planConstructionBuildings = document.getElementById(`planConstruction-building-list`);

    if (!planConstructionBuildings) return;
    
    planConstructionBuildings.innerHTML = ``;
    for (const [priority, buildings] of Object.entries(constructionPriorities)) {
        buildings.forEach(building => {
            if (resourcesFacilities.includes(building.type)) return;
            building.resource = null;
            building.resourceId = null;
            const buildingBox = canBuildThis(village, building, false, false);

            if (!buildingBox) return;

            const buildingCost = getBuildingCost(village, building, false); 
            
            const {buildingAction, buildingInfo} = getBuildingOptions(village, building, priority);
            
            buildingBox.appendChild(buildingCost);
            buildingBox.appendChild(buildingAction);
            buildingBox.appendChild(buildingInfo);

            planConstructionBuildings.appendChild(buildingBox);
        });
    }
    const villageResources = village.resources;
    villageResources.forEach(resource => {
        const amenagement = amenagementForResource(resource.type);
        const building = getBuildingInfo(amenagement, "building");
        building.resource = resource;
        building.resourceId = resource.id;
        const buildingBox = canBuildThis(village, building, resource);

        if (!amenagement || !buildingBox) return;
            
        const buildingCost = getBuildingCost(village, building, resource); 
        
        const {buildingAction, buildingInfo} = getBuildingOptions(village, building, "high");
        
        buildingBox.appendChild(buildingCost);
        buildingBox.appendChild(buildingAction);
        buildingBox.appendChild(buildingInfo);
        
        planConstructionBuildings.appendChild(buildingBox);
    });
    
    $("#planConstruction-view").find(".canBuild").prependTo('#planConstruction-building-list').data({
        villageId: village.id,
    })
}
function canBuildThis(village, building, resource){
    
    const existingBuilding = building.resourceId ?
                            village.amenagements.some(b => b.resourceId === building.resourceId) :
                            village.amenagements.some(b => b.type === building.type);

    const inConstruction = building.resourceId ?
                            village.constructionSite.some(b => b.resourceId === building.resourceId) :
                            village.constructionSite.some(b => b.type === building.type);

    const inQueue = building.resourceId ?
                    village.constructionQueue.some(b => b.resourceId === building.resourceId) :
                    village.constructionQueue.some(b => b.type === building.type);

    if (existingBuilding || inConstruction || inQueue) { //  || inConstruction || inQueue || (resourcesBuilding && !resourcescheck)
        return false;
    }

    let canBuild = true;

    const hasInsufficientPopulation = village.workers.length < building.minPopulation;
    
    const checkPrerequisites = village.checkPrerequisites(building);
    const canAffordBuilding = village.canAffordBuilding(building);

    if (hasInsufficientPopulation || !checkPrerequisites || !canAffordBuilding) {
        canBuild = false;
    };

    const buildingBox = document.createElement('div');
    buildingBox.id = `${building.type}`;
    buildingBox.className  = `building-planConstruction-box ${canBuild?"canBuild":"pakobos"}`;
    buildingBox.innerHTML = `<div class="building-planConstruction-img building-${building.type}"></div>`;

    return buildingBox;
}
function getBuildingCost(village, building, resource){
    const amenagement = amenagementForResource(resource.type);
    const buildingCost = document.createElement('div');
    buildingCost.className = `building-planConstruction-cost`;
    let buildingCostBody = `<div class="building-planConstruction-type">${amenagementFrName(building.type)||""}`;
    buildingCostBody += resource && ["mine", "farm"].includes(amenagement)? ` de ${ressourceFrName(resource.type)||""}` : ``;
    buildingCostBody += `</div>`;
    buildingCostBody += `<div class="building-planConstruction-cost-list">`;
        Object.entries(building.cost).forEach(([name, value]) => {
            buildingCostBody += `<div class="building-cost"><div class="cost-icon cost-${name}"></div>x${value}<span  class="info-text">${value} ${ressourceFrName(name)||""}</span></div>`;
        });
    buildingCostBody += `</div>`;
    buildingCostBody += `<div class="minPopulation"><i class='fas fa-users'></i> > ${building.minPopulation - 1}</div>`;

    const existingBuilding = village.amenagements.find(b => b.type === building.type && b?.id === building?.id);
    const time = existingBuilding ? existingBuilding.constructionTime * (existingBuilding.getLevel() + 1) * 1.25 : building.constructionTime;
    
    buildingCostBody += `<div class="constructionTime"><i class='far fa-clock'></i> ${Math.floor(time / 60)} minutes</div>`;
    buildingCost.innerHTML = buildingCostBody;
    
    return buildingCost;
}
function getBuildingOptions(village, building, priority){
    const buildingAction = document.createElement('div');
    buildingAction.className = `building-planConstruction-action`;
    buildingAction.innerHTML = `<div class="planConstruction-show-info"><i class='far fa-question-circle'></i></div>`;

    const addToQueue = document.createElement('div');
    
    addToQueue.className = `planConstruction-addToQueue`;
    addToQueue.dataset.building = JSON.stringify(building);
    addToQueue.dataset.priority = priority;
    addToQueue.dataset.villageId = village.id;
    addToQueue.innerHTML = `<i class='far fa-plus-square'></i>`;

    buildingAction.appendChild(addToQueue);

    const buildingInfo = document.createElement('div');
    buildingInfo.className = `building-planConstruction-info`;
    buildingInfo.innerHTML = `<div class="btn-close close-building-planConstruction-info"></div>`;
    buildingInfo.innerHTML += `<i class='fas fa-info-circle'></i> <div class="building-planConstruction-type">${amenagementFrName(building.type)||""}</div> Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.`;

    return {buildingAction, buildingInfo};
}
function displayConstructionQueue(village, selector){
    $(`.village-${village.id} ${selector}`).empty();
    if (village.constructionQueue.length <= 0 && village.constructionSite.length <= 0) {
        $(`.village-${village.id} ${selector}`).append(`<span style="padding: 0px 15px;">Vide!</span>`);
        return;
    }
    if (village.constructionSite.length > 0) {
        let constructionSite = ``;
        village.constructionSite.forEach((building, index) => {
            constructionSite += `<div id="queue-${index}" type="${building.type}" class="batiment-box ${building.type}-box constructionSite">`;
            constructionSite += `<div class="batiment-icon icon-${building.type}">`;
            const resource = building.resource && ["mine", "farm"].includes(building.type)? ` de ${ressourceFrName(building.resource.type)||""}`: ``;
            constructionSite += `${amenagementIcon(building.type)} <div class="batiment-name">${amenagementFrName(building.type)||""} ${resource}</div>`;
            constructionSite += `</div>`;
            
            const existingBuilding = village.amenagements.find(amenagement => amenagement.type === building.type && amenagement?.resourceId === building?.resourceId);
            const time = existingBuilding ? existingBuilding.constructionTime * (existingBuilding.getLevel() + 1) * 1.25 : building.constructionTime;

            constructionSite += `<span class="endTime" constructionTime="${time}" statTime="${building.startAt}"><i class='far fa-clock'></i><span class="info-text"></span></span>`;
            constructionSite += `</div>`;
        });
        $(`.village-${village.id} ${selector}`).append(constructionSite);
    }
    let constructionQueue = ``;
    village.constructionQueue.forEach((building, index) => {
        constructionQueue += `<div id="queue-${index}" type="${building.type}" class="batiment-box ${building.type}-box">`;
        constructionQueue += `<div class="batiment-icon icon-${building.type}">`;

        const resource = building?.resource && ["mine", "farm"].includes(building.type)? ` de ${ressourceFrName(building.resource.type)||""}`: ``;

        constructionQueue += `${amenagementIcon(building.type)} <div class="batiment-name">${amenagementFrName(building.type)||""} ${resource}</div>`;
        constructionQueue += `</div>`;
        constructionQueue += `<span class="" constructionTime="${building.constructionTime}"><i class='far fa-hourglass'></i><span class="info-text"></span></span>`;
        constructionQueue += `</div>`;
    });
    $(`.village-${village.id} ${selector}`).append(constructionQueue);
}

function updateBuildingListCost(village){
    $(`.building-planConstruction-box`).forEach(element =>{
        const buildingId = element.attr(`id`);
        const existingBuilding = village.amenagements.find(b => b.id === buildingId);
        if (!existingBuilding || existingBuilding.level >= 3) return;
        
        const newCost = existingBuilding.calculateCostForNextLevel();
        existingBuilding.cost = newCost;
        const contentBox = $(`#${buildingId}`).find(`.building-planConstruction-cost-list`);
        contentBox.empty();
        Object.entries(newCost).forEach(([name, value]) => {
            let html = `<div class="building-cost"><div class="cost-icon cost-${name}"></div>x${value}<span  class="info-text">${value} ${ressourceFrName(name)||""}</span></div>`;
            contentBox.append(html);
        });
    });
}
function updateBuildingListConstructionTime(village){
    $(`.building-planConstruction-box`).forEach(element =>{
        const buildingId = element.attr(`id`);
        const existingBuilding = village.amenagements.find(b => b.id === buildingId);
        if (!existingBuilding || existingBuilding.level >= 3) return;
        
        const newTime = existingBuilding.constructionTime * (existingBuilding.getLevel() + 1) * 1.25;
        // existingBuilding.constructionTime = newTime;
        const contentBox = $(`#${buildingId}`).find(`.constructionTime`);
        contentBox.empty();
        let html = `<i class='far fa-clock'></i> ${Math.floor(existingBuilding.constructionTime / 60)} minutes`;
        contentBox.append(html);
    });
}
function updateBuildingListMinPopulation(village){
    $(`.building-planConstruction-box`).forEach(element =>{
        const buildingId = element.attr(`id`);
        const existingBuilding = village.amenagements.find(b => b.id === buildingId);
        if (!existingBuilding || existingBuilding.level >= 3) return;

        const newMinPopulation = village.workers.length < (existingBuilding.level / 0.25) + existingBuilding.minPopulation;
        // existingBuilding.minPopulation = newMinPopulation;
        const contentBox = $(`#${buildingId}`).find(`.minPopulation`);
        contentBox.empty();
        let html = `<i class='fas fa-users'></i> > ${existingBuilding.minPopulation - 1}`;
        contentBox.append(html);
    });
}
