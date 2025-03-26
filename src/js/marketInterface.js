let selectedResources = new Set();
$(document).on("click",`.market-btn`, function() {
    const $this = $(this);
    const {village, building} = getThisBuilding($this, true);
    const parents = $(this).parents(`#village-management-box.village-${village.id}`);
    parents.find(`.display-village-components`).fadeOut(100).remove();
    displayMarket(village);
    parents.find(`.market-view`).fadeIn(100).css({
        display: 'flex'
    });
});
$(document).on("click",`.trade-agreement-btn`, function() {
    const $this = $(this);
    const villageId = $this.attr("data-villageid");
    const tradeVillageId = $this.attr("data-tradevillageid");
    const showTradeAgreementDiv = document.createElement('div');
    showTradeAgreementDiv.className = `village-trade-agreement`;
    showTradeAgreementDiv.dataset.villageid = villageId;
    showTradeAgreementDiv.dataset.tradevillageid = tradeVillageId;
    tradeAgreement(villageId, tradeVillageId, showTradeAgreementDiv);
    $(`.village-${villageId} #village-management > div:not(#village-management-drop)`).fadeOut(250,()=>{
        document.querySelector(`.village-${villageId} #village-management`).append(showTradeAgreementDiv);
        const selector = $(`.village-trade-agreement`);
        tradeAgreementCost(selector);
    });
});
$(document).on("click",`.close-trade-agreement`, function() {
    const $this = $(this);
    const parent = $this.parents(`.village-trade-agreement`);
    const villageId = parent.attr("data-villageid");
    selectedResources.clear();
    parent.fadeOut(150).remove();
    $(`.village-${villageId} #village-management > div`).fadeIn(250);
});
$(document).on("click",`.tradePriority`, function() {
    const $this = $(this);
    const parent = $this.parents(`.trade-agreement-terms`);
    const checked = $this.is(':checked');
    if (checked) {
        parent.attr("data-tradePriority", true);
    }else{
        parent.attr("data-tradePriority", false);
    }
    const selector = $this.parents(`.village-trade-agreement`);
    tradeAgreementCost(selector);
});
$(document).on("click",`.freeTradeAgreement`, function() {
    const $this = $(this);
    const parent = $this.parents(`.trade-agreement-terms`);
    const checked = $this.is(':checked');
    if (checked) {
        parent.attr("data-freeTrade", true);
        parent.attr(`data-traderesources`, null );
        parent.find(`.selected-marketed-resources`).remove();
        parent.find(`.marketed-resources`).fadeOut(10);
    }else{
        parent.attr("data-freeTrade", false);
        parent.find(`.marketed-resources`).fadeIn(10);
        const villageId = $this.parents(`.village-trade-agreement`).attr(`data-villageid`);
        const tradeVillageId = $this.parents(`.village-trade-agreement`).attr(`data-tradevillageid`);
        const marketedResourcesDiv = document.querySelector(`.village-${villageId} .village-trade-agreement .marketed-resources`);
        tradeAgreementResources(villageId, tradeVillageId, marketedResourcesDiv);
    }
    const selector = $this.parents(`.village-trade-agreement`);
    tradeAgreementCost(selector);
});
$(document).on("click",`.close-new-marketed-resources`, function() {
    const $this = $(this);
    const parent = $this.parents(`.trade-agreement-terms`);
    parent.find(`.select-option-container`).fadeOut(250).remove();
    parent.find(`.save-trade-agreement`).fadeIn(100);
});
$(document).on("click",`.resourceSelect`, function() {
    const $this = $(this);
    const parent = $this.parents(`.trade-agreement-terms`);
    const traderesources = JSON.parse($this.attr(`data-resource`));
    let parentData = [];
    if (parent.attr(`data-traderesources`)) {
        parentData = JSON.parse(parent.attr(`data-traderesources`));
    }
    const checked = $this.is(':checked');
    if (checked) {
        selectedResources.add(traderesources.type);
        parentData.push(traderesources);
        parent.attr("data-traderesources", JSON.stringify(parentData));
        $this.attr('checked', 'checked');
        const li = $this.parents(`li`);
        const selector = $this.parents(`.village-trade-agreement`);
        tradeAgreementCost(selector);
    }else{
        selectedResources.delete(traderesources.type);
        parentData = parentData.filter(data => data.type !== traderesources.type);
        parent.attr("data-traderesources", JSON.stringify(parentData));
        $this.removeAttr('checked');
        const selector = $this.parents(`.village-trade-agreement`);
        tradeAgreementCost(selector);
    }
});
$(document).on("click",`.village-trade-agreement .save-trade-agreement`, function() {
    const $this = $(this);
    const parentAgreement = $this.parents(`.village-trade-agreement`);
    const parentTerms = $this.parents(`.trade-agreement-terms`);
    const {villageid, tradevillageid} = parentAgreement.data();
    let agreementData = parentTerms.attr(`data-traderesources`); //JSON.parse();
    agreementData = agreementData? JSON.parse(agreementData) : null;
    const tradePriority = parentTerms.attr(`data-tradePriority`);
    const freeTrade = parentTerms.attr(`data-freeTrade`);
    const agreementDuration = parentTerms.attr(`data-agreementDuration`) || 90;
    const taxAmount = parentTerms.attr(`data-taxAmount`);
    const tradeVillage = villages.find( village => village.id === tradevillageid);
    const village = villages.find( village => village.id === villageid);
    const existingImportAgreement = village.tradeAgreement.find(agreement => agreement.id === tradevillageid);
    const existingExportAgreement = tradeVillage.tradeAgreement.find(agreement => agreement.id === villageid);
    const selector = $this.parents(`.village-trade-agreement`);
    tradeAgreementCost(selector);
    if (existingImportAgreement) {
        existingImportAgreement.tradePriority = tradePriority;
        existingImportAgreement.freeTrade = freeTrade;
        existingImportAgreement.taxAmount = taxAmount;
        existingExportAgreement.expiration = Date.now() + agreementDuration * 60000;
        existingImportAgreement.resourcesToImport = (agreementData && agreementData.length > 0)? agreementData : null;
    }else{
        const importationAgreement = {
            id: tradevillageid,
            tradePriority,
            freeTrade,
            taxAmount,
            resourcesToImport : (agreementData && agreementData.length > 0)? agreementData : null,
            expiration: Date.now() + agreementDuration * 60000,
        }
        village.tradeAgreement.push(importationAgreement);
    }
    if (existingExportAgreement) {
        existingExportAgreement.tradePriority = tradePriority;
        existingExportAgreement.freeTrade = freeTrade;
        existingExportAgreement.taxAmount = taxAmount;
        existingExportAgreement.expiration = Date.now() + agreementDuration * 60000;
        existingExportAgreement.resourcesToExport =(agreementData && agreementData.length > 0)? agreementData : null;
    }else{
        const exportationAgreement = {
            id : villageid,
            tradePriority,
            freeTrade,
            taxAmount,
            resourcesToExport : (agreementData && agreementData.length > 0)? agreementData : null,
            expiration: Date.now() + agreementDuration * 60000,
        }
        tradeVillage.tradeAgreement.push(exportationAgreement);
    }
    $(`.close-trade-agreement`).click();
});
let marketNeeds = [];
function displayMarket(village){
    const fragment = document.createDocumentFragment();
    const marketBox = document.createElement('div');
    marketBox.className = `market-view display-village-components`;
    const villageMarket = document.createElement('div');
    villageMarket.className = `village-market`;
    const marketSideDiv = document.createElement('div');
    marketSideDiv.className = `market-side`;
    marketSideDiv.style.width = `calc((100% / 3) - 10px)`;
    marketSideDiv.style.height = `100%`;
    const marketBodyDiv = document.createElement('div');
    marketBodyDiv.className = `market-body`;
    marketBodyDiv.style.width = `calc((100% / 1.5) - 10px)`;
    marketBodyDiv.style.height = `100%`;
    const nearbyMarketDiv = document.createElement('div');
    nearbyMarketDiv.className = `village-nearby-market`;
    let nearbyMarketHtml = `<div>Proximité Commercial</div><div class="nearby-market-list"></div>`;
    nearbyMarketDiv.innerHTML = nearbyMarketHtml;
    marketSideDiv.appendChild(nearbyMarketDiv);
    villageMarket.appendChild(marketSideDiv);
    const marketHeaderDiv = document.createElement('div');
    marketHeaderDiv.className = `village-market-header`;
    let marketHeaderHtml = `<div class="village-needs"></div><div class="market-can-sell"></div>`;
    marketHeaderDiv.innerHTML = marketHeaderHtml;
    marketBodyDiv.appendChild(marketHeaderDiv);
    const marketsOffersDiv = document.createElement('div');
    marketsOffersDiv.className = `village-market-management`;
    marketsOffersDiv.innerHTML = `<div class="market-management-title">Ordres d'achats et de ventes</div>
        <table>
            <thead>
                <tr>
                    <th class="col-resource">Ressource</th>
                    <th class="col-stock">Stock Actuel</th>
                    <th class="col-buy">Acheter si &lt;</th>
                    <th class="col-sell">Vendre si &gt;</th>
                    <th class="col-action">Actions</th>
                </tr>
            </thead>
        </table>
        <div class="market-management-table-body">
            <table>
                <tbody class="market-management-rules">
                </tbody>
            </table>
        </div>`;
    marketBodyDiv.appendChild(marketsOffersDiv);
    villageMarket.appendChild(marketBodyDiv);
    /* const currentTradeDiv = document.createElement('div');
    currentTradeDiv.className = `village-current-trade`; 
    villageMarket.appendChild(currentTradeDiv); */
    marketBox.appendChild(villageMarket);
    fragment.appendChild(marketBox);
    document.querySelector('#buildings-box').appendChild(fragment);
    displayVillageNeeds(village);
    displayMarketCanSell(village);
    displayNearbyMarket(village);
    marketNeeds = [...village.otherSupplyNeeds, ...village.agriFoodNeeds];
    marketsNeeds(marketNeeds);
    displayMarketsRules(village);
}
function displayVillageNeeds(village){
    const villageNeeds = document.querySelector(`.village-${village.id} .market-view .village-needs`);
    if (!villageNeeds) return;
    villageNeeds.innerHTML = "";
    const needs = [
        ...village.agriFoodNeeds || [],
        ...village.otherSupplyNeeds || [],
    ];
    const villageNeedsTitleDiv = document.createElement('div');
    villageNeedsTitleDiv.style.width = `100%`;
    villageNeedsTitleDiv.style.fontSize = `12px`;
    villageNeedsTitleDiv.innerHTML = `Besoin`;
    villageNeeds.appendChild(villageNeedsTitleDiv);
    needs.forEach(need => {
        if (Math.floor(need.quantity) > 0) {
            const prodNeedDiv = document.createElement('div');
            prodNeedDiv.className = `prod-need need-${need.priority}`;
            prodNeedDiv.innerHTML = `<div class="need-icon need-${need.type}"></div>
                <span class="need-quantity need-${need.type}-quantity">${Math.floor(need.quantity)}</span>
                <span  class="info-text" style="color:#333;">${ressourceFrName(need.type)||""}</span>`;
            villageNeeds.appendChild(prodNeedDiv);
        }
    })
}
function displayMarketCanSell(village){
    const marketCanSellWrapper = document.querySelector(`.village-${village.id} .market-view .market-can-sell`);
    if (!marketCanSellWrapper) return;
    marketCanSellWrapper.innerHTML = "";
    const market = village.amenagements.find(a => a.type === "market");
    const marketCanSellDiv = document.createElement('div');
    marketCanSellDiv.style.width = `100%`;
    marketCanSellDiv.style.fontSize = `12px`;
    marketCanSellDiv.innerHTML = `Disponible à la vente`;
    marketCanSellWrapper.appendChild(marketCanSellDiv);
    market.marketCanSell.forEach(resource => {
        if (Math.floor(resource.quantity) > 0) {
            const prodCanSellDiv = document.createElement('div');
            prodCanSellDiv.className = `prod-canSell canSell-${resource.priority}`;
            prodCanSellDiv.innerHTML = `<div class="canSell-icon canSell-${resource.type}"></div>
                <span class="canSell-quantity canSell-${resource.type}-quantity">${Math.floor(resource.quantity)}</span>
                <span  class="info-text" style="color:#333;">${ressourceFrName(resource.type)||""}</span>`;
            marketCanSellWrapper.appendChild(prodCanSellDiv);
        }
    })
}
function displayNearbyMarket(village){
    const nearbyMarket = document.querySelector(`.village-${village.id} .market-view .nearby-market-list`);
    if (!nearbyMarket) return;
    nearbyMarket.innerHTML = "";
    const port = village.amenagements.find(a => a.type === "port");
    const nearbyMarketList = port ? findNearbyMarketWrapAround(village) : findNearbyMarket(village);
    nearbyMarketList.forEach(market => {
        const marketVillage = market.getBuildingVillage().village;
        const island = islands.find(isle => isle.islandID == marketVillage.islandID);
        const containerDiv = document.createElement('div');
        containerDiv.id = `market-${market.id}`;
        containerDiv.className = `nearbyMarket-container`;
        containerDiv.innerHTML = `<div class="market-village-name">${marketVillage.name} <span class="market-island-name">${island.name}(${island.islandID})</span></div>
            <div class="market-exchange">
                <div class="this-market-buy"></div>
                <div class="this-market-sells"></div>
            </div>`;
        const tradeAgreement = marketVillage.tradeAgreement.find(agreement => agreement.id === village.id);
        const exchangeOptionDiv = document.createElement('div');
        exchangeOptionDiv.className = `market-exchange-option`;
        exchangeOptionDiv.innerHTML = (tradeAgreement)? 
            `<div class="trade-agreement trade-taxe"><b>${tradeAgreement.taxAmount * 100}% taxes</b></div>` :
            `<div class="trade-agreement trade-agreement-btn" data-villageid="${village.id}" data-tradevillageid='${marketVillage.id}'></div>`;
        containerDiv.appendChild(exchangeOptionDiv);
        nearbyMarket.appendChild(containerDiv);
        displayMarketBuy(village.id, marketVillage, market);
        displayMarketSell(village.id, market);
    });
}
function displayMarketBuy(villageId, marketVillage, market){
    const marketBuys = document.querySelector(`.village-${villageId} .market-view .nearby-market-list #market-${market.id} .this-market-buy`);
    if (!marketBuys) return;
    marketBuys.innerHTML = "";
    const needs = [
        ...marketVillage.agriFoodNeeds || [],
        ...marketVillage.otherSupplyNeeds || [],
    ];
    marketBuys.innerHTML = `<div class="market-exchange-title">ACHETE</div>`;
    needs.forEach(need => {
        if (Math.floor(need.quantity) > 0) {
            const prodNeedDiv = document.createElement('div');
            prodNeedDiv.className = `prod-need need-${need.priority}`;
            prodNeedDiv.innerHTML = `<div class="need-icon need-${need.type}"></div>
                <span  class="info-text" style="color:#333">${ressourceFrName(need.type)||""}</span>`;
            marketBuys.appendChild(prodNeedDiv);
        }
    })
}
function displayMarketSell(villageId, market){
    const marketSells = document.querySelector(`.village-${villageId} .market-view .nearby-market-list #market-${market.id} .this-market-sells`);
    if (!marketSells) return;
    marketSells.innerHTML = "";
    marketSells.innerHTML = `<div class="market-exchange-title">VEND</div>`;
    market.marketCanSell.forEach(resource => {
        if (Math.floor(resource.quantity) > 0) {
            const prodCanSellDiv = document.createElement('div');
            prodCanSellDiv.className = `prod-canSell canSell-${resource.priority}`;
            prodCanSellDiv.innerHTML = `<div class="canSell-icon canSell-${resource.type}"></div>
                <span  class="info-text" style="color:#333">${ressourceFrName(resource.type)||""}</span>`;
            marketSells.appendChild(prodCanSellDiv);
        }
    })
}
function tradeAgreement(villageId, tradeVillageId, selector){
    const tradeVillage = villages.find( village => village.id === tradeVillageId);
    const tradeMarket = tradeVillage.amenagements.find(amenagement => amenagement.type === "market");
    selector.innerHTML = `<div class="trade-agreement-header">ACCORD COMMERCIAL<div class="btn-close close-trade-agreement"></div></div>`;
    const tradeAgreementDiv = document.createElement('div');
    tradeAgreementDiv.className = `trade-agreement-terms`;
    tradeAgreementDiv.innerHTML = `<p class="">Accord commercial avec <b>${tradeVillage.name}</b></p>
        <h6 class="">Termes et conditions</h6>
        </div>`;
        const termsConditionsDiv = document.createElement('div');
        termsConditionsDiv.className = `terms-and-conditions`;
        termsConditionsDiv.innerHTML = `<span class="terms-title">- Échange commercial prioritaire
                <label class="terms-select agreement-select">
                    <input class="tradePriority" type="checkbox" name="tradePriority">
                    <span class="input-checked"></span>
                </label>
            </span>
            <span class="terms-title">- Accord de libre-échange
                <label class="terms-select agreement-select">
                    <input class="freeTradeAgreement" type="checkbox" name="freeTradeAgreement">
                    <span class="input-checked"></span>
                </label>
            </span>`;
        tradeAgreementDiv.appendChild(termsConditionsDiv);
        const marketedResourcesDiv = document.createElement('div');
        marketedResourcesDiv.className = `marketed-resources`;
        marketedResourcesDiv.innerHTML = `<h6 class="terms-title">Ressources :</h6>`;
        tradeAgreementResources(villageId, tradeVillageId, marketedResourcesDiv);
        tradeAgreementDiv.appendChild(marketedResourcesDiv);
        const durationDiv = document.createElement('div');
        durationDiv.className = `select-agreement-duration`;
        durationDiv.innerHTML = `<label>Étendue sur :</label><br/>
            <input type="range" name="durationSelection" min="90" max="360" value="90" step="90" class="agreement-duration" list="agreementDuration" />
            <datalist id="agreementDuration">
                <option value="90" label="3 mois"></option>
                <option value="180" label="6 mois"></option>
                <option value="270" label="9 mois"></option>
                <option value="360" label="12 mois"></option>
            </datalist>`;
        tradeAgreementDiv.appendChild(durationDiv);
        const tradeTaxDiv = document.createElement('div');
        tradeTaxDiv.className = `trade-tax`;
        tradeTaxDiv.innerHTML = `Taxes douanières: `;
        tradeAgreementDiv.appendChild(tradeTaxDiv);
        const agreementCostDiv = document.createElement('div');
        agreementCostDiv.className = `trade-agreement-cost`;
        agreementCostDiv.innerHTML = `Coût de l'accord commercial: `;
        tradeAgreementDiv.appendChild(agreementCostDiv);
        const saveBtnDiv = document.createElement('div');
        saveBtnDiv.className = `save-trade-agreement`;
        saveBtnDiv.innerHTML = `Save`;
        tradeAgreementDiv.appendChild(saveBtnDiv);
    selector.appendChild(tradeAgreementDiv);
}
function tradeAgreementResources(villageId, tradeVillageId, selector){

    const tradeVillage = villages.find( village => village.id === tradeVillageId);
    const tradeMarket = tradeVillage.amenagements.find(amenagement => amenagement.type === "market");

    if (!tradeMarket || tradeMarket.marketCanSell.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.innerHTML = `<div class="selected-marketed-resources">Vide!</div>`;
        selector.appendChild(emptyDiv);
        return;
    }

    const tradeOptionUL = document.createElement('ul');
    tradeOptionUL.className = `selected-marketed-resources`;
    const options = tradeMarket.marketCanSell;
    options.forEach(resource => {
        const isSelected = selectedResources.has(resource);

        const tradeOptionLI = document.createElement('li');
        tradeOptionLI.className = `resource`;
        tradeOptionLI.innerHTML = `<div class="prod-canSell">
                <div class="canSell-icon canSell-${resource.type}"></div>
                <span  class="info-text" style="color:#333">${ressourceFrName(resource.type)||""}</span>
            </div>
            <label class="terms-select resource-select">
                <input class="resourceSelect" data-resource='${JSON.stringify(resource)}' ${isSelected?"checked":""} type="checkbox" name="resourceSelect">
                <span class="input-checked"></span>
            </label>`;
        tradeOptionUL.appendChild(tradeOptionLI);
    });
    selector.appendChild(tradeOptionUL);
}
$(document).on("input", ".agreement-duration", function() {
    const $this = $(this);  
    const agreementDuration = $this.val();
    const parent = $this.parents(`.trade-agreement-terms`);
    parent.attr("data-agreementDuration", agreementDuration);

    const selector = $this.parents(`.village-trade-agreement`);
    tradeAgreementCost(selector);
});
function tradeAgreementCost(selector){
    const baseCost = 200;
    const tradevillageId = selector.attr(`data-tradevillageid`);
    const tradeVillage = villages.find( village => village.id === tradevillageId);
    const tradePriority = selector.find(`.trade-agreement-terms`).attr(`data-tradePriority`);
    const freeTrade = selector.find(`.trade-agreement-terms`).attr(`data-freeTrade`);
    const traderesourcesString = selector.find(`.trade-agreement-terms`).attr(`data-traderesources`);
    const agreementDuration = selector.find(`.trade-agreement-terms`).attr(`data-agreementDuration`) || 90;
    const traderesources = traderesourcesString? JSON.parse(traderesourcesString) : [];
    const market = tradeVillage.amenagements.find(a => a.type === "market");
    const marketCanSell = market.marketCanSell || [];

    const tradePriorityTax = tradePriority === true || tradePriority=== "true" ? 0.07 : 0.02;
    const freeTradeTax = freeTrade === true || freeTrade === "true" ? 0.05 : 0.01;
    const resourceTax = (marketCanSell.length / traderesources.length > 0 ? traderesources.length : 1) / 100;

    const tradePriority_factor = tradePriority === true || tradePriority === "true" ? 1.2 : 1;
    const freeTrade_factor =  freeTrade === true && tradePriority === true || freeTrade === "true" && tradePriority === "true" ? 2 :
                             freeTrade === true || freeTrade === "true" ? 1.5 : 1;

    const resourceCatValues = {
        agriFoodResources: 1,
        strategicResources: 2,
        luxuryResources: 4,
        manufacturedResources: 3
    };
    const agreementDurationFactor = {
        cost90 : 1,
        cost180 : 0.95,
        cost270 : 0.8,
        cost360 : 0.7,
        tax90 : 0,
        tax180 : 0.01,
        tax270 : 0.02,
        tax360 : 0.03
    }

    let taxTotal = Math.round(((tradePriorityTax + freeTradeTax + resourceTax) + Number.EPSILON) * 100) / 100 ;

    taxTotal = taxTotal - agreementDurationFactor[`tax${agreementDuration}`];

    let resourceCost = 0;
    marketCanSell.forEach(resource => {
        if (agriFoodResources.includes(resource.type)) resourceCost += traderesources.length * resourceCatValues.agriFoodResources;
        if (strategicResources.includes(resource.type)) resourceCost += traderesources.length * resourceCatValues.strategicResources;
        if (luxuryResources.includes(resource.type)) resourceCost += traderesources.length * resourceCatValues.luxuryResources;
        if (manufacturedResources.includes(resource.type)) resourceCost += traderesources.length * resourceCatValues.manufacturedResources;
    });
    let agreementCost = baseCost + (baseCost * tradePriority_factor) + (baseCost * freeTrade_factor) + Math.max((resourceCost * 10), 100);
    
    agreementCost = agreementCost * agreementDurationFactor[`cost${agreementDuration}`];
    
    selector.find(`.trade-agreement-terms`).attr(`data-taxAmount`, taxTotal);
    selector.find(`.trade-agreement-terms`).find(`.trade-tax`).empty().append(`Taxes douanières: <br/><b>${Math.round(taxTotal * 100)}%</b>.`);
    selector.find(`.trade-agreement-terms`).find(`.trade-agreement-cost`).empty().append(`Coût de l'accord commercial: <br/><b>${Math.round(agreementCost)}</b> pieces.`);
}
let tableBody = null;
function displayMarketsRules(village){
    tableBody = document.querySelector(`.village-${village.id} .village-market-management .market-management-rules`);
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const market = village.amenagements.find(a => a.type === "market");
    const warehouse = market.getBuildingVillage().warehouse;
    const allResources = [...agriFoodResources, ...strategicResources, ...luxuryResources, ...manufacturedResources]; 

    const rules = market.marketRules;

    allResources.forEach(resource => {
        const isNeed = marketsNeeds(resource);
        const resourceStock = warehouse.pickFromStorage(resource, null, "quantity") || 0;

        const btnSell = (resourceStock && resourceStock > 0)? `<button class="market-rules-btn btn-sell" data-order="sale" data-villageid="${village.id}" data-type="${resource}">💰</button>` : 
        `<button class="market-rules-btn" disabled style="opacity:0.5;">💰</button>`;
        const alreadySet = rules.find(rule => rule.type === resource);
        const row = document.createElement("tr");
        row.className = `${alreadySet?.order || ""}`;
        row.innerHTML = `
            <td class="col-resource"><div class="resource-column"><div class="need-icon need-${resource}"></div><span>${ressourceFrName(resource)||""}</span></div></td>
            <td class="col-stock" id="stock-${resource}">${Math.floor(resourceStock)}</td>
            <td class="col-buy"><input type="number" min="10" step="10" id="buy-${resource}" value="${alreadySet && alreadySet.minStock || ""}" placeholder="--"></td>
            <td class="col-sell"><input type="number" min="10" step="10" id="sell-${resource}" value="${alreadySet && alreadySet.maxStock || ""}" placeholder="--"></td>
            <td class="col-action">
                <button class="market-rules-btn btn-buy" data-villageid="${village.id}" data-order="purchase" data-type="${resource}">🛒</button>
                ${btnSell}
                <button class="market-rules-btn btn-clear" data-villageid="${village.id}" data-type="${resource}">❌</button>
            </td>`;
            
        if (isNeed) {
            row.className += " prioritize";
            tableBody.prepend(row);
        }else{
            tableBody.appendChild(row);
        }
    });
    
    tableBody.addEventListener("click", function (e) {
        const type = e.target.dataset.type;
        const order = e.target.dataset.order;
        const villageId = e.target.dataset.villageid;
        
        if (e.target.classList.contains("btn-buy")) {

            const qty = document.getElementById(`buy-${type}`).value || 0;
            updateMarketRule(villageId, type, qty, null, order);
        }

        if (e.target.classList.contains("btn-sell")) {
             
            const qty = document.getElementById(`sell-${type}`).value || 0;
            updateMarketRule(villageId, type, null, qty, order);
        }

        if (e.target.classList.contains("btn-clear")) {
            $(`#buy-${type}`).parents(`tr`).removeClass(`sale purchase`);
            $(`#sell-${type}`).parents(`tr`).removeClass(`sale purchase`);
            removeMarketRule(villageId, type);
        }
    });
}
function marketsNeeds(resource) {
    resourcesNeeds = marketNeeds.map((need) => need.type );
    return resourcesNeeds.includes(resource);
}

function updateMarketRule(villageId, type, buyQty, sellQty, order) {
    const village = villages.find( village => village.id === villageId);
    const market = village.amenagements.find(a => a.type === "market");
    const marketRules = market.marketRules;
    let rule = marketRules.find(r => r.type === type);

    if (!rule && parseInt(buyQty) > 0 || parseInt(sellQty) > 0) {
        rule = { 
            type, 
            minStock: parseInt(buyQty) || null, 
            maxStock: parseInt(sellQty) || null,
            order 
        };
        marketRules.push(rule);
        $(`#buy-${type}`).parents(`tr`).removeClass(`sale purchase`).addClass(order);
        $(`#sell-${type}`).parents(`tr`).removeClass(`sale purchase`).addClass(order);
        
        return;
    }
    if (parseInt(buyQty) > 0 || parseInt(sellQty) > 0) {
        rule.minStock = parseInt(buyQty) || null;
        rule.maxStock = parseInt(sellQty) || null;
        rule.order = order;
        $(`#buy-${type}`).parents(`tr`).removeClass(`sale purchase`).addClass(order);
        $(`#sell-${type}`).parents(`tr`).removeClass(`sale purchase`).addClass(order);
    }
}

function removeMarketRule(villageId, type) {
    const village = villages.find( village => village.id === villageId);
    const market = village.amenagements.find(a => a.type === "market");
    const marketRules = market.marketRules;

    const index = marketRules.findIndex(r => r.type === type);
    if (index !== -1) marketRules.splice(index, 1);

    document.getElementById(`buy-${type}`).value = null;
    document.getElementById(`sell-${type}`).value = null;

}

function displayTradeAgreementTimeLeft(expiration){
    const currentTime = Date.now();
    const remainingTime = Math.floor((expiration - currentTime ) / 1000);
    const jours = Math.floor(remainingTime / 60);
    if (jours <= 0) {
        return `Expirer`;
    }
    if (jours > 1) {
        return `${jours}jours`;
    }
    return `${jours}jour`;
}
