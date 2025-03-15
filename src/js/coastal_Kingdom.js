const villages = [];
const workers = [];
const buildings = [];
const allMarkets = [];
const allPorts = [];
const allDockyards = [];

let grid = [];
let islands = [];
let maps;
let selectedId;
let activeIsleBox = 0;
let isleBoxLeft = 0;

const gridSize = {x:50, y:50}; // Taille de la grille 

const mapSizeValue = {20:"-47px 5px",30:"-102px 5px",40:"-155px 5px",50:"-210px 5px",
                    60:"-265px 5px",70:"-316px 5px",80:"-370px 5px",90:"-425px 5px",100:"-480px 5px"}; //10:"6px 5px", 
const mapRessourceFrName = {
    gems_purple: "Pierres précieuses",
    gold: "Minerai d'Ors",
    silver: "Minerai d'Argents",
    gems_green: "Pierres précieuses",
    gems_blue: "Pierres précieuses",
    iron: "Minerai de Fers",
    copper: "Minerai de Cuivres",
    sugar_cane: "Cannes à Sucres",
    vine: "Vignes",
    tobacco: "Tabacs",
    coffee: "Cafés",
    cacao: "Cacaos",
    coal: "Minerai de Charbons",
    wool: "Laines",
    orchards: "Vergers",
    meat: "Bétails",
    cotton: "Cottons",
    banana: "Bananeraie",
    cereals: "Céréales",
    stone: "Carrières de pierres",
    wood: "Bois (Forêt)",
    fish: "Poissons",
};

function islandplain(){
    const islandplain = "choose-island-p";
    return islandplain;
}
function islandhill1(){
    const islandhill1 = ["choose-island-1hill-1", "choose-island-1hill-2"];
    return islandhill1[Math.floor(Math.random() * islandhill1.length)];
}
function islandhill2(){
    const islandhill2 = ["choose-island-2hill-1", "choose-island-2hill-2","choose-island-2hill-3", "choose-island-2hill-4"];
    return islandhill2[Math.floor(Math.random() * islandhill2.length)];
}
function islandmountain1(){
    const islandmountain1 = ["choose-island-1mountain-1", "choose-island-1mountain-2"];
    return islandmountain1[Math.floor(Math.random() * islandmountain1.length)];
}
function islandmountain2(){
    const islandmountain2 = ["choose-island-2mountain-1", "choose-island-2mountain-2"];
    return islandmountain2[Math.floor(Math.random() * islandmountain2.length)];
}
function islandhill1mountain1(){
    const islandhill1mountain1 = ["choose-island-1hill-1mountain-1", "choose-island-1hill-1mountain-2", "choose-island-1hill-1mountain-3", "choose-island-1hill-1mountain-4"];
    return islandhill1mountain1[Math.floor(Math.random() * islandhill1mountain1.length)];
}
function islandhillsmountains(){
    const islandhillsmountains = ["choose-island-hill-mountain-1", "choose-island-hill-mountain-2", "choose-island-hill-mountain-3", "choose-island-hill-mountain-4"];
    return islandhillsmountains[Math.floor(Math.random() * islandhillsmountains.length)];
}
const chooseIslandView = {
    "plain": islandplain(),
    "hill1": islandhill1(),
    "hill2": islandhill2(),
    "mountain1": islandmountain1(),
    "mountain2": islandmountain2(),
    "hill1mountain1": islandhill1mountain1(),
    "hillsmountains": islandhillsmountains(),
}
let laodingMap = false;
$(document).ready(function () {
    tornKingdomMap();
    maps = JSON.parse(localStorage.getItem("maps")) || {};

    
    $(document).on("click","#readMe-link", function() {
        $("#intro-panel").fadeOut(()=>{
            $("#readMe").fadeIn();
        });
    });
    $(document).on("click","#close-readMe", function() {
        $("#readMe").fadeOut(()=>{
            $("#intro-panel").fadeIn();
        });
    });

    $("#map-size-conf .map-size-numberX").css({
        "background": `no-repeat url("./src/assets/images/map-size-number-box.png") 0px 0px / 60px 60px,
                    no-repeat url("./src/assets/images/num_10-100.png") ${mapSizeValue[gridSize.y]} / 540px 50px`,
    });
    $("#map-size-conf .map-size-numberY").css({
        "background": `no-repeat url("./src/assets/images/map-size-number-box.png") 0px 0px / 60px 60px,
                    no-repeat url("./src/assets/images/num_10-100.png") ${mapSizeValue[gridSize.x]} / 540px 50px`,
    });
    $(document).on("mouseover",".number-plus, .number-minus", function() {
        $(this).addClass("number-plus-minus-mouseenter");
    });
    $(document).on("mouseout",".number-plus, .number-minus", function(e) {
        $(this).removeClass("number-plus-minus-mouseenter");
    });
    $(document).on("click",".number-plus, .number-minus", function(e) {
        if ($(this).hasClass("plusX") && gridSize.y < 100) {
            gridSize.y += 10;
        }else if ($(this).hasClass("minusX") && gridSize.y > 20){
            gridSize.y -= 10;
        }else if ($(this).hasClass("plusY") && gridSize.x < 100) {
            gridSize.x += 10;
        }else if ($(this).hasClass("minusY") && gridSize.x > 20){
            gridSize.x -= 10;
        }
        $("#map-size-conf .map-size-numberX").css({
            "background": `no-repeat url("./src/assets/images/map-size-number-box.png") 0px 0px / 60px 60px,
                        no-repeat url("./src/assets/images/num_10-100.png") ${mapSizeValue[gridSize.y]} / 540px 50px`,
        });
        $("#map-size-conf .map-size-numberY").css({
            "background": `no-repeat url("./src/assets/images/map-size-number-box.png") 0px 0px / 60px 60px,
                        no-repeat url("./src/assets/images/num_10-100.png") ${mapSizeValue[gridSize.x]} / 540px 50px`,
        });
        $(this).addClass("number-plus-minus-mousedown");
    });
    $(document).on("mouseup",".number-plus, .number-minus", function(e) {
        $(this).removeClass("number-plus-minus-mousedown");
    });
    $(document).on("click","#genMap", function(e) {
        $(this).addClass("genMap-click");
        const max = Math.max(gridSize.x, gridSize.y);
        const min = 3;
        const islandCount = max;
        const generated = generateIslands(gridSize, islandCount);

        grid = generated.grid;
        islands = generated.islands;
        const resourceStats = getResourceStats(islands);
        const mapInfoDiv = document.getElementById('map-info');
        mapInfoDiv.innerHTML = '';
        let html = '<h6>Catalogue des ressources sur la carte</h6>';
        html += '<div class="resource-catalog">';
        Object.entries(resourceStats).forEach(element => {
            html += `<div class="resource ${element[0]}-box">`;
            html += `<div class="icon icon-${element[0]}"></div>`;
            html += `<div class="resource-name">${mapRessourceFrName[element[0]]}</div><div class="resource-num">${element[1].totals}</div>`;
            html += `</div>`;
        });
        html += '</div>';
        mapInfoDiv.innerHTML = html;
        setTimeout(() => {
            const fname = syllables[Math.floor(Math.random() * syllables.length)];
            const midName = connectors[Math.floor(Math.random() * connectors.length)];
            const lname = suffixes[Math.floor(Math.random() * suffixes.length)];
            let mapName = `${fname}${midName}${lname}`;
            $(this).removeClass("genMap-click");
            $("#map-name-box").fadeIn().css({"display":"flex"});
            $("#save-map").fadeIn(2500).css({"display":"flex"});
            $("input#map-name").val(`${mapName}`);
        }, 100);
    });
    $(document).on("mouseover",".resource-catalog .resource", function() {
        $(this).find(".resource-name").css({"display":"block"});
    });
    $(document).on("mouseout",".resource-catalog .resource", function() {
        $(this).find(".resource-name").removeAttr("style");
    });
    $(document).on("click","#mini-map .mapCase", function() {
        let id = $(this).attr("id").split("-")[1];
        console.log(`#mini-map .mapCase click : ${id}`);
        const x = parseInt(id.split("x")[0]);
        const y = parseInt(id.split("x")[1]);
        let vw = parseInt($("#game-box").css("width"));
        let vh = parseInt($("#game-box").css("height"));
        moveMapTo(x, y, (vw / 2.05), (vh / 2.05), ()=>{});

        // $("#game-box .mapCase").fadeTo(500, 0,()=>{});
        /* $("#mini-map-loop").animate({
            opacity: "0.1"
        },500, ()=>{
            moveMapTo(x, y, ()=>{
                $("#mini-map-loop").animate({
                    opacity: "0.6"
                }, 500);
                $("#game-box .mapCase").fadeTo(1000, 1);
            });
        }); */
    });
    $(document).on("click","#backToHome", function() {
        $("#game-box").fadeTo(1500, 0,()=>{
            $("#game-box").empty();
        });
        $("#mini-map").fadeOut(10);
        $("#mini-map").empty();
        $("#islandsOption-backdrop").remove();
        $("#load-map-panel-back-btn").click();
        $("#new-map-generator-back-btn").click();
        $("#game-loading").fadeIn(100,()=>{
            $("#new-map-generator-box").fadeTo(2500, 1);
            $("#game-loading").fadeOut(2000);

        });
        $(this).fadeOut(100).remove();
    });
    let animStart = false;
    $(document).on("click","#save-map", function() {
        let pos = 100;
        if (animStart) return;
        $("#save-map-text").addClass("genMap-click");
        setTimeout(() => {
            $("#save-map-text").removeClass("genMap-click");
        }, 75);
        animStart = true;
        $("#save-map-text").fadeOut(  function() {
            $("#save-signature").css({
                "display": "block",
                "background-position-y": `${pos}px`,
            });
            const inputMapName = $("input#map-name").val();

            maps[inputMapName] = { grid, islands, gridSize };
            localStorage.setItem("maps", JSON.stringify(maps) );

            const signItnval = setInterval(() => {
                if (pos > -1505) {
                    pos -= 100;
                }else{
                    clearInterval(signItnval);
                    goGame();
                    animStart = false;
                    $(`#save-map, #save-map-text, #save-signature`).removeAttr(`style`);
                }
                $("#save-signature").css({
                    "background-position-y": `${pos}px`,
                })
            }, 150);
        }).css({"display":"block","color":"#ff2329"}).fadeIn(3000); //3,150
    });
    $(document).on("click","#load-map-btn", function() {
        $("#welcome").fadeOut(()=>{
            $("#load-map-panel").fadeIn(()=>{
                showMapListe();
            }).css({"display":"flex"});
        });
    });
    $(document).on("click",".map_sup", function() {
        const id = $(this).parent().attr("id");
        console.log("map_sup", JSON.stringify(id) );
        supMapById(id);
    });
    $(document).on("click","#load-map-panel-back-btn", function() {
        $("#load-map-panel").fadeOut(()=>{
            $("#welcome").fadeIn();
        });
    });
    $(document).on("click","#new-map-btn", function() {
        $("#welcome").fadeOut(()=>{
            $("#new-map-generator").fadeIn(()=>{
                $(document).on("click","#new-map-generator-back-btn", function(e) {
                    $("#new-map-generator").fadeOut(()=>{
                        $("#map-info").empty();
                        $("#map-name-box").fadeOut();
                        $("#welcome").fadeIn();
                    });
                });
            }).css({"display":"flex"});
        });
    });
    $(document).on("click",".map-list-element .map_name, .map-list-element .map_num_island", function() {
        if (laodingMap) return;
        laodingMap = true;
        const id = $(this).parent().attr("id");
        const map = maps[id];
        grid = map.grid;
        islands = map.islands;
        gridSize.x = map.gridSize.x;
        gridSize.y = map.gridSize.y;
        goGame();
    });
    
    $(document).on("click",".chooseIsland-select", function() { // off("click",".chooseIsland-select").
        const selected = $(`.isle-box`).eq(activeIsleBox);
        $('#game-box').addClass("selection");
        const id = selected.attr("id");
        selectedId = id;
        console.log(`selectedId : ${selectedId}`);
        const x = parseInt(id.split("-")[0]);
        const y = parseInt(id.split("-")[1]);
        $(`.island_${selectedId}`).addClass("noBorder").fadeTo(1000, 1);
        let vw = parseInt($("#game-box").css("width"));
        let vh = parseInt($("#game-box").css("height"));
        moveMapTo(x, y, (vw / 2.05), (vh / 2.05), ()=>{});
        $("#islandsOption-popup, #islandsOption-backdrop").fadeOut(100);
        $('#game-box').after('<div id="chooseIsland-back" class="btn-back"></div>');
    });
    $(document).on("mouseenter",`.mapCase`, function() {
        $("#placeTobuild").remove();
        const alreadyHasVillage = $(this).find(".village").length > 0 ||
                                    $(this).hasClass("beach-4") ||
                                    $(this).hasClass("river-3") ||
                                    $(this).hasClass("river-4") ||
                                    $(this).hasClass("corner-in-2") ||
                                    $(this).hasClass("hill") ||
                                    $(this).hasClass("mountain") ||
                                    $(this).hasClass("deser") ||
                                    $(this).hasClass("oasis");
                                    // $(this).hasClass("river-2") || $(this).hasClass("corner-out-1") || $(this).hasClass("river-1") ||

        if (alreadyHasVillage && $('#game-box').hasClass("selection") && !$(this).hasClass("ocean")) {
            const square = `<div id="placeTobuild" class="cantBuildVillageHere"></div>`;
            $(this).append(square);
        }else if (!alreadyHasVillage && $('#game-box').hasClass("selection") && !$(this).hasClass("ocean")){
            const square = `<div id="placeTobuild" class="buildVillageHere"></div>`;
            $(this).append(square);
        }
    });
    $(document).on("mouseleave",`.mapCase`, function() {
        $(this).removeClass("cantBuildVillageHere buildVillageHere"); 
        $("#placeTobuild").remove();
    });
    $(document).on("click","#chooseIsland-back.btn-back", function() {
        $('#game-box').removeClass("selection");
        $(`.island_${selectedId}`).removeClass("noBorder").fadeTo(100, 0);
        $("#islandsOption-popup, #islandsOption-backdrop").fadeIn(500);
        $(this).hide().remove();
    });
    $(document).on("click",".chooseIsland-skip", function() {
        $('#game-box').addClass("selection");
        // $('#game-box').removeClass("selection");
        $("#game-box .mapCase").fadeTo(1500, 1);
        $('#game-box').removeClass("dontMove");
        miniMap(()=>{
            $("#mini-map .mapCase").fadeTo(50,1);
            $("#mini-map").fadeIn(2500);
            $("#backToHome").fadeIn(2500);
        });
        $("#islandsOption-backdrop").fadeOut(1500);
        $("#islandsOption-popup").fadeOut(1000, ()=>{
            $(this).remove();
        });
    });
    $(document).on("click",".isle-content .isle-show", function() {
        const id = $(this).parents(".isle-box").attr("id");
        const x = parseInt(id.split("-")[0]);
        const y = parseInt(id.split("-")[1]);
        $(`.island_${id}`).addClass("noBorder").fadeTo(1000, 1);
        let vw = parseInt($("#game-box").css("width"));
        let vh = parseInt($("#game-box").css("height"));
        moveMapTo(x, y, (vw / 2.05), (vh / 2.05), ()=>{});
        $("#islandsOption-popup, #islandsOption-backdrop").fadeOut(100);
        $('#game-box').after('<div id="chooseIsland-back" class="btn-back"></div>');
        $(document).on("click","#chooseIsland-back.btn-back", function() {
            $(`.island_${id}`).removeClass("noBorder").fadeTo(100, 0);
            $("#islandsOption-popup, #islandsOption-backdrop").fadeIn(500);
            $(this).hide().remove();
        })
    });
    $(document).on("click","#opt-prev", function() {
        if (activeIsleBox > 0) {
            $("#chooseIsland-decision").hide();
            $(this).removeClass("disabled");
            activeIsleBox--;
            isleBoxLeft += 550;
            $("#islandsOption-box").animate({
                left: `${isleBoxLeft}px`,
            },()=>{
                $("#chooseIsland-decision").show();
            });
        }
        if (activeIsleBox <= 0) {
            $(this).addClass("disabled");
        }
        if (activeIsleBox < $(`.isle-box`).length - 1 ) {
            $("#opt-next").removeClass("disabled");
        }
    });
    $(document).on("click","#opt-next", function() {
        if (activeIsleBox < $(`.isle-box`).length - 1 ) {
            $("#chooseIsland-decision").hide();
            $(this).removeClass("disabled");
            activeIsleBox++;
            isleBoxLeft -= 550;
            $("#islandsOption-box").animate({
                left: `${isleBoxLeft}px`,
            },()=>{
                $("#chooseIsland-decision").show();
            });
        }
        if (activeIsleBox > 0) {
            $("#opt-prev").removeClass("disabled");
        }
        if (activeIsleBox >= $(`.isle-box`).length - 1 ) {
            $(this).addClass("disabled");
        }
    });
    $(document).on("click",`#placeTobuild.buildVillageHere`, function() {
        const buildVillage = $('#game-box').hasClass("selection");
        if (!buildVillage || velocityX !== 0 || velocityY !== 0) return;
        isDragging = false;
        $('#game-box').removeClass("selection");
        $('#game-box').removeClass("dragging");
        $('#game-box .mapCase').removeClass("noBorder");
        $(this).parents(".mapCase").addClass("human-village-cell")
        selectedId = $(this).parents(".mapCase").data("islandId");

        const cell_id = $(this).parents(".mapCase").attr("id").split("-")[1];
        const cell_x = parseInt(cell_id.split("x")[0]);
        const cell_y = parseInt(cell_id.split("x")[1]);
        const type = $(this).parents(".mapCase").hasClass("plain") ? "interieur" : "cotiere";
        createVillage(selectedId, cell_x, cell_y, type);
        
        $('#game-box').removeClass("selection");
        $("#game-box .mapCase").fadeTo(1500, 1);
        $('#game-box').removeClass("dontMove");
        miniMap(()=>{
            $("#mini-map .mapCase").fadeTo(250,1);
            $("#mini-map").fadeIn(750);
            $("#backToHome").fadeIn(750);
        });
        $("#islandsOption-backdrop").fadeOut(1500);
        $("#islandsOption-popup").fadeOut(1000, ()=>{
            $(this).remove();
        });
        $("#chooseIsland-back.btn-back").hide().remove();
    });

});
function showMapListe(){
    const maps = JSON.parse(localStorage.getItem("maps"));
    let html = '';
    if (maps && Object.entries(maps).length > 0) {
        html += '<div id="load-map-panel-back-btn" class="btn-back"></div>';
        html += '<h6>Cartes Sauvegardées</h6>';
        html += '<div id="map-list"><div id="list-header">';
        html += '<span class="name">Nom</span><span class="num-island">Nmb. Îles</span><span class="sup-map">supprimer</span></div>';
        html += '</div>';
        $("#load-map-panel").empty().append(html);
        const mapListDiv = document.getElementById('map-list');
        Object.entries(maps).forEach(([key, values]) => {
            const SauvegardesDiv = document.createElement('div');
            SauvegardesDiv.className = 'map-list-element';
                SauvegardesDiv.id += `${key}`;
                SauvegardesDiv.innerHTML += `<div class="map_name">${key}</div>`;
                SauvegardesDiv.innerHTML += `<div class="map_num_island">${values.islands.length}</div>`;
                SauvegardesDiv.innerHTML += `<div class="map_sup"><i class="far fa-trash-alt"></i></div>`;
            mapListDiv.appendChild(SauvegardesDiv);
        });
        Object.keys(torn_Kingdom_maps).filter( key => {
            $(`#list-header`).after($(`#${key}`));
        });
    }else{
        html += '<div id="load-map-panel-back-btn" class="btn-back"></div>';
        html += '<h6>Vide!</h6>';
        html += '<div id="map-list"></div>';
        $("#load-map-panel").empty().append(html);
    }
}
function supMapById(id){
    delete maps[id];
    localStorage.setItem("maps", JSON.stringify(maps) );
    showMapListe();
}
function goGame(){
    addVillageToMap(islands, ()=>{
        $("#game-box .mapCase").fadeTo(10, 0);        

        $("#game-box").after('<div id="islandsOption-backdrop"></div>');
        $("#game-loading").fadeIn(1000);
        $("#new-map-generator-box").fadeTo(500, 0,()=>{$("#new-map-generator-box").fadeOut(100)})
        $("#islandsOption-backdrop").fadeTo(5000, 0.7,()=>{
            $("#game-loading").fadeOut(1000);
        });
        $("#game-box").fadeTo(5500, 1,()=>{
            console.log(getIslandStats(islands));
            const allIslandOption = getIslandStats(islands);
            const islandOption = allIslandOption.filter(island => island.land >= 3 && Object.keys(island.totalFreeResources).length > 2);
            chooseIsland(islandOption);
        });
        laodingMap = false;
    })
}
function addVillageToMap(islands, callback){
    islands.forEach(island => {
        const currentIslandVillages = generateVillages(island);
        island.villages = currentIslandVillages;
    });
    showMap(grid, islands, ()=>{});
    callback();
}
function chooseIsland(islandOption){
    const fragment = document.createDocumentFragment();
    const presentIslandDIV = document.createElement('div');
    presentIslandDIV.id = `islandsOption-popup`;
    presentIslandDIV.className = `islands-popup`;
    presentIslandDIV.style.position = 'absolute';
    presentIslandDIV.style.width = `550px`;
    presentIslandDIV.style.height = `400px`;
    presentIslandDIV.style.top = `calc(50% - 200px)`;
    presentIslandDIV.style.left = `calc(50% - 275px)`;
    presentIslandDIV.style.margin = `0 auto`;
    presentIslandDIV.innerHTML = "";
    let html = `<div id="prev-next-btn-box"><div id="opt-prev" class="prev-next-btn disabled"></div><div id="opt-next" class="prev-next-btn"></div></div>`;
    html += '<div id="islandsOption-box">';

    islandOption.forEach((element, index) => {

        const viewClass = selectViewClass(element.totalLandType);
        html += `<div id="${element.islandID}" class="isle-box ${chooseIslandView[viewClass]}">`;
            html += `<div class="isle-content">`;
                html += `<div class="isle-show"><i class='fas fa-eye'></i></div>`;
                html += `<div class="isle-name"><h5>${element.islandName}</h5></div>`;
                html += `<div class="isle-position">Position : (${element.islandID})</div>`;
                html += `<div>resources disponible</div>`;
                html += `<div class="resource-catalog">`;
                    let potentialMine = 0;
                    Object.entries(element.totalResources).forEach(([key, val]) => {
                        if (!["gems_purple","gems_green","gems_blue","gold","silver","iron","copper","coal"].includes(key)) {
                            html += `<div class="resource ${key}-box">`;
                            html += `<div class="icon icon-${key}"></div>`;
                            html += `<div class="resource-name">${mapRessourceFrName[key]}</div><div class="resource-num">${element.totalFreeResources[key] || 0}/${val}</div>`;
                            html += `</div>`;
                        }else{
                            potentialMine += val;
                        }
                    });
                html += '</div>';
                html += `<div class="info">`;
                    if (potentialMine > 3 ) {
                        html += `<div class="miningPotential">Île à fort potentiel minier.</div>`;
                    }else if (potentialMine > 2 ) {
                        html += `<div class="miningPotential">Des resources minières sont pressenties sur l'île.</div>`;
                    }else if (potentialMine >= 1 ) {
                        html += `<div class="miningPotential">Possible présence de resources minières sur l'île.</div>`;
                    }
                    if (element.villages.length > 0 ) {
                        const prefix = ["Un","Deux", "Trois", "Quatre"];
                        const suffix = (element.villages.length > 1) ? "villages sont déjà présents" : "village est déjà présent";
                        html += `<div class="villagePresent">${prefix[element.villages.length - 1]} ${suffix} sur l'île.</div>`;
                    }
                html += '</div>';
            html += '</div>';
        html += '</div>';
    });
    html += '</div>';
    html += `<div id="chooseIsland-decision"><div class="chooseIsland-skip">skip</div><div class="chooseIsland-select">Commencer là</div></div>`;
    presentIslandDIV.innerHTML = html;
    fragment.appendChild(presentIslandDIV);
    $('#game-box').addClass("dontMove");
    document.querySelector('#game-box').after(fragment);
    
    $("#opt-prev").addClass("disabled");
}
function moveMapTo(x, y, vw, vh, callback){

    let scrlToLeft = (y * cellSize) - vw; 
    let scrlToTop = (x * cellSize) - vh;

    $("#game-box").animate({
        scrollLeft: scrlToLeft,
        scrollTop: scrlToTop
    }, 1500, "swing");

    let loopLeft = (scrlToLeft / cellSize) * (cellSize * 0.05) - 6;
    let loopTop = (scrlToTop / cellSize) * (cellSize * 0.05) - 6;
    
    $("#mini-map-loop").animate({
        left: `${(loopLeft <= 0)? 0 : loopLeft}px`,
        top: `${(loopTop <= 0)? 0 : loopTop}px`
    }, 1500, "swing");

    callback();
}
function selectViewClass(LandsType){
    const hill = LandsType['hill'] || 0;
    const mountain = LandsType['mountain'] || 0;

    if (hill > 1 && mountain > 1) {
        return "hillsmountains";
    }else if (hill > 1 && mountain === 1) {
        return "hillsmountains";
    }else if (hill === 1 && mountain > 1) {
        return "hillsmountains";
    }else if (hill === 1 && mountain === 1) {
        return "hill1mountain1";
    }else if (hill > 1 && mountain === 0) {
        return "hill2";
    }else if (hill === 1 && mountain === 0) {
        return "hill1";
    }else if (hill === 0 && mountain > 1) {
        return "mountain2";
    }else if (hill === 0 && mountain === 1) {
        return "mountain1";
    }else if (hill === 0 && mountain === 0) {
        return "plain";
    }
    return "plain";
}
function createVillage(islandId, cell_x, cell_y, type){
    const island = islands.find(island => island.islandID === islandId);

    const villageID = `${cell_x}-${cell_y}`;
    const village = new Villages(getRandomName(), cell_x, cell_y, type, 1, villageID, islandId, type);
    village.owner = "human";
    island.villages.push(village);
    villages.push(village);
    village.assignNearbyResources(island);
    const villageDiv = document.createElement('div');
    villageDiv.id = `village-${cell_x}x${cell_y}`;
    villageDiv.className = `village human-village ${village.type}`;
    villageDiv.style.position = 'absolute';
    // villageDiv.style.opacity = 0;
    villageDiv.innerHTML = `<span class="village-name">${village.name}</span>`;
    const cell = document.getElementById(`cell-${cell_x}x${cell_y}`);
    cell.appendChild(villageDiv);
    // $(`#village-${cell_x}x${cell_y}`).fadeTo(500, 1);
}
function miniMap(callback){
    let vw = parseInt($("#game-box").css("width"));
    let vh = parseInt($("#game-box").css("height"));
    const scaleFactor = cellSize * 0.05;
    const miniMap_width = scaleFactor * gridSize.y + 8;
    const miniMap_height = scaleFactor * gridSize.x + 8;
    const mini_map = $("#mini-map");
    mini_map.after(`<div id="backToHome"><i class='fas fa-home'></i><span class="info-text">Accueil</span></div>`);
    mini_map.css({
        "width": `${miniMap_width}px`,
        "height": `${miniMap_height}px`,
    });
    $("#backToHome").css({
        "left": `${miniMap_width + 4}px`,
        "bottom": `${miniMap_height - 25}px`,
    });

    const mapCase = $("#game-box .mapCase").clone();
    mapCase.find(".ship, .village, .island-name, .island-resource").remove(); // , .ocean
    mapCase.each(function() {
        let topPos = parseInt($(this).css("top")) / cellSize;
        let leftPos = parseInt($(this).css("left")) / cellSize;
        $(this).css({
            "top": `${topPos * scaleFactor}px`,
            "left": `${leftPos * scaleFactor}px`,
            "width": `${scaleFactor}px`,
            "height": `${scaleFactor}px`,
        });
    });
    $("#mini-map-loop").remove();
    $("#mini-map").append("<div id='mini-map-loop'></div>");
    
    $("#mini-map-loop").css({
        "width": `${(vw * 0.05) + 6}px`,
        "height": `${(vh * 0.05) + 6}px`,
    });
    $("#mini-map").append(mapCase);
    callback();
}