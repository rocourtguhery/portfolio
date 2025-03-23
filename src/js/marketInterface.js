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
        parent.find(`.selected-marketed-resources .resource`).remove();
        parent.find(`.selected-marketed-resources .li-add-resources`).fadeOut(10);
        parent.find(`.marketed-resources`).fadeOut(10);
    }else{
        parent.attr("data-freeTrade", false);
        parent.find(`.selected-marketed-resources .li-add-resources`).fadeIn(10);
        parent.find(`.marketed-resources`).fadeIn(10);
    }
    const selector = $this.parents(`.village-trade-agreement`);
    tradeAgreementCost(selector);
});
$(document).on("click",`.add-new-marketed-resources`, function() {
    const $this = $(this);
    const parent = $this.parents(`.trade-agreement-terms`);
    const villageId = $this.attr("data-villageid");
    const tradeVillageId = $this.attr("data-tradevillageid");
    tradeAgreementResources(villageId, tradeVillageId, parent);
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
        parentData.push(traderesources);
        parent.attr("data-traderesources", JSON.stringify(parentData));
        $this.attr('checked', 'checked');
        const li = $this.parents(`li`);
        const selector = $this.parents(`.village-trade-agreement`);
        tradeAgreementCost(selector);
        parent.find(`.marketed-resources ul.selected-marketed-resources .li-add-resources`).before(`<li id="${traderesources.id}" class="resource">${li.html()}</li>`);
    }else{
        parentData = parentData.filter(data => data.type !== traderesources.type);
        parent.attr("data-traderesources", JSON.stringify(parentData));
        $this.removeAttr('checked');
        const selector = $this.parents(`.village-trade-agreement`);
        tradeAgreementCost(selector);
        const li = parent.find(`.marketed-resources li#${traderesources.id}`).fadeOut(50).remove();
    }
});
$(document).on("click",`.village-trade-agreement .save-trade-agreement`, function() {
    const $this = $(this);
    const parentAgreement = $this.parents(`.village-trade-agreement`);
    const parentTerms = $this.parents(`.trade-agreement-terms`);
    const {villageid, tradevillageid} = parentAgreement.data();
    const agreementData = JSON.parse(parentTerms.attr(`data-traderesources`));
    const tradePriority = parentTerms.attr(`data-tradePriority`);
    const freeTrade = parentTerms.attr(`data-freeTrade`);
    const taxAmount = parentTerms.attr(`data-taxAmount`);
    const tradeVillage = villages.find( village => village.id === tradevillageid);
    const village = villages.find( village => village.id === villageid);

    const existingImportAgreement = village.tradeAgreement.find(a => a.tradeVillageid === tradevillageid);
    const existingExportAgreement = tradeVillage.tradeAgreement.find(a => a.tradeVillageid === villageid);

    const selector = $this.parents(`.village-trade-agreement`);
    tradeAgreementCost(selector);

    if (existingImportAgreement) {
        existingImportAgreement.tradePriority = tradePriority;
        existingImportAgreement.freeTrade = freeTrade;
        existingImportAgreement.taxAmount = taxAmount;
        existingImportAgreement.resourcesToImport = (agreementData && agreementData.length > 0)? agreementData : null;
    }else{
        const importationAgreement = {
            tradevillageid,
            tradePriority,
            freeTrade,
            taxAmount,
            resourcesToImport : (agreementData && agreementData.length > 0)? agreementData : null
        }
        village.tradeAgreement.push(importationAgreement);
    }
    if (existingExportAgreement) {
        existingExportAgreement.tradePriority = tradePriority;
        existingExportAgreement.freeTrade = freeTrade;
        existingExportAgreement.taxAmount = taxAmount;
        existingExportAgreement.resourcesToExport =(agreementData && agreementData.length > 0)? agreementData : null;
    }else{
        const exportationAgreement = {
            tradevillageid : villageid,
            tradePriority,
            freeTrade,
            taxAmount,
            resourcesToExport : (agreementData && agreementData.length > 0)? agreementData : null
        }
        tradeVillage.tradeAgreement.push(exportationAgreement);
    }
    $(`.close-trade-agreement`).click();
});

function displayMarket(village){
    const fragment = document.createDocumentFragment();
    const marketBox = document.createElement('div');
    marketBox.className = `market-view display-village-components`;

    const villageMarket = document.createElement('div');
    villageMarket.className = `village-market`;

    const nearbyMarketDiv = document.createElement('div');
    nearbyMarketDiv.className = `village-nearby-market`;
    let nearbyMarketHtml = `<div>Proximité Commercial</div><div class="nearby-market-list"></div>`;
    nearbyMarketDiv.innerHTML = nearbyMarketHtml;
    villageMarket.appendChild(nearbyMarketDiv);

    const marketHeaderDiv = document.createElement('div');
    marketHeaderDiv.className = `village-market-header`;
    let marketHeaderHtml = `<div class="village-needs"></div><div class="market-can-sell"></div>`;
    marketHeaderDiv.innerHTML = marketHeaderHtml;
    villageMarket.appendChild(marketHeaderDiv);

    const currentTradeDiv = document.createElement('div');
    currentTradeDiv.className = `village-current-trade`; 
    villageMarket.appendChild(currentTradeDiv);

    marketBox.appendChild(villageMarket);

    fragment.appendChild(marketBox);

    document.querySelector('#buildings-box').appendChild(fragment);
    displayVillageNeeds(village);
    displayMarketCanSell(village);
    displayNearbyMarket(village)

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

        const exchangeOptionDiv = document.createElement('div');
        exchangeOptionDiv.className = `market-exchange-option`;
        const tradeAgreement = marketVillage.tradeAgreement.find(agreement => agreement.id === village.id);
        
        exchangeOptionDiv.innerHTML = (tradeAgreement)? 
            `<div class="trade-agreement trade-taxe">${tradeAgreement.tax}</div>` :
            `<div class="trade-agreement trade-agreement-btn" data-villageid="${village.id}" data-tradevillageid='${marketVillage.id}'></div>`;
        
        containerDiv.appendChild(exchangeOptionDiv);
        nearbyMarket.appendChild(containerDiv);
        displayMarketBuy(village.id, marketVillage, market);
        displayMarketSell(village.id, market);
    })
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

        const addResources = (tradeMarket.marketCanSell.length > 0) ? 
            `<div class="add-new-marketed-resources" data-villageid="${villageId}" data-tradevillageid="${tradeVillageId}"><i class="fa fa-plus"></i></div>`:
            `<div class="no-resources"><i class="fa fa-plus"></i></div>`;

        const marketedResourcesDiv = document.createElement('div');
        marketedResourcesDiv.className = `marketed-resources`;
        marketedResourcesDiv.innerHTML = `<h6 class="terms-title">Ressources :</h6>
            <ul class="selected-marketed-resources">
                <li class="li-add-resources">${addResources}</li>
            </ul>`;
        tradeAgreementDiv.appendChild(marketedResourcesDiv);


        const durationDiv = document.createElement('div');
        durationDiv.className = `select-agreement-duration`;
        durationDiv.innerHTML = `<label>Expiration :</label><br/>
            <input type="range" name="durationSelection" min="90" max="360" value="180" step="90" class="agreement-duration" list="agreementDuration" />
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
    const marketedResources = document.querySelector(`.village-${villageId} .trade-agreement-terms .marketed-resources`);
    if (!marketedResources) return;

    const tradeVillage = villages.find( village => village.id === tradeVillageId);
    const tradeMarket = tradeVillage.amenagements.find(amenagement => amenagement.type === "market");

    if (!tradeMarket || tradeMarket.marketCanSell.length === 0) return;
    selector.find(`.save-trade-agreement`).fadeOut(150);
    
    const village = villages.find( village => village.id === villageId);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = `select-option-container`;
    optionsDiv.innerHTML = `<div class="select-option-header">Ressources selection</div>
        <div class="btn-close close-new-marketed-resources"></div>`;

        const tradeOptionDiv = document.createElement('div');
        tradeOptionDiv.className = `trade-option`;
            
            const tradeOptionUL = document.createElement('ul');
            const options = tradeMarket.marketCanSell;
            options.forEach(resource => {
                const tradeAgreement = village.tradeAgreement.find(agreement => agreement.villageid === tradeVillage.id);
                const isSelected = tradeAgreement?.resources.find(resource => resource.type === option);

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
        tradeOptionDiv.appendChild(tradeOptionUL);
    optionsDiv.appendChild(tradeOptionDiv);
    
    marketedResources.append(optionsDiv);
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
    const agreementDuration = selector.find(`.trade-agreement-terms`).attr(`data-agreementDuration`);
    const traderesources = traderesourcesString? JSON.parse(traderesourcesString) : [];
    const market = tradeVillage.amenagements.find(a => a.type === "market");
    const marketCanSell = market.marketCanSell || [];

    const tradePriorityTax = tradePriority === true || tradePriority=== "true" ? 0.07 : 0.02;
    const freeTradeTax = freeTrade === true || freeTrade === "true" ? 0.05 : 0.01;
    const resourceTax = (marketCanSell.length / traderesources.length > 0 ? traderesources.length : 1) / 100;

    const TaxTotal = Math.round(((tradePriorityTax + freeTradeTax + resourceTax) + Number.EPSILON) * 100) / 100 ;

    const tradePriority_factor = tradePriority === true || tradePriority === "true" ? 1.2 : 1;
    const freeTrade_factor =  freeTrade === true && tradePriority === true || freeTrade === "true" && tradePriority === "true" ? 2 :
                             freeTrade === true || freeTrade === "true" ? 1.5 : 1;

    const resourceCatValues = {
        agriFoodResources: 1,
        strategicResources: 2,
        luxuryResources: 4,
        manufacturedResources: 3
    };
    let resourceCost = 0;
    marketCanSell.forEach(resource => {
        if (agriFoodResources.includes(resource.type)) resourceCost += traderesources.length * resourceCatValues.agriFoodResources;
        if (strategicResources.includes(resource.type)) resourceCost += traderesources.length * resourceCatValues.strategicResources;
        if (luxuryResources.includes(resource.type)) resourceCost += traderesources.length * resourceCatValues.luxuryResources;
        if (manufacturedResources.includes(resource.type)) resourceCost += traderesources.length * resourceCatValues.manufacturedResources;
    });

    const agreementCost = baseCost + (baseCost * tradePriority_factor) + (baseCost * freeTrade_factor) + Math.max((resourceCost * 10), 100);
    selector.find(`.trade-agreement-terms`).attr(`data-taxAmount`, agreementCost);
    selector.find(`.trade-agreement-terms`).find(`.trade-tax`).empty().append(`Taxes douanières: <br/><b>${Math.round(TaxTotal * 100)}%</b>.`);
    selector.find(`.trade-agreement-terms`).find(`.trade-agreement-cost`).empty().append(`Coût de l'accord commercial: <br/><b>${agreementCost}</b> pieces.`);
}