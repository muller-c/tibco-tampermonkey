// ==UserScript==
// @name         Optimisation d'acdc
// @namespace    http://harmonie-mutuelle.fr/
// @version      0.2
// @description  Add number of elements
// @author       You
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @match        https://acdc/apps/CaseManager/*
// @grant        none
// @updateURL https://raw.githubusercontent.com/muller-c/tibco-tampermonkey/master/Optimisation.js
// ==/UserScript==


//Remove spinner after 2 secs
waitForKeyElements(".spinner", actOnNode);
function actOnNode (jQueryNode) {
    //--- Do whatever you need to on individual nodes here:
    // For example:
    setTimeout(function(){
        $(".spinner").remove();
    }, 2);
}
waitForKeyElements("body > div.layout-row.flex > div > div > tasks-section-directive > div > div:nth-child(2) > custom-task-page-directive > div > div > custom-task-list-directive > div > div > div", fixName);

function fixName (jQueryNode) {
    //--- Do whatever you need to on individual nodes here:
    // For example:

    var scope = angular.element($('[ng-controller=CaseManagerCtrl]')).scope();
    document.querySelector("body > md-toolbar.appHeader.md-primary.md-hue-2.layout-align-space-between-center.layout-row.md-harmonieMutuelle-theme > div.col-md-5.layout-row > div.layout-align-center-center.layout-row > div").textContent = scope.userResourceDetails.name
    scope.$apply();
}
waitForKeyElements("custom-task-page-directive", filtrerCustom);
function filtrerCustom (jQueryNode) {
    //--- Do whatever you need to on individual nodes here:
    // For example:
    var scope = angular.element('.button-blue').scope().$parent.$parent ;

    document.querySelector("#panel1 > div.panel-collapse.collapse.in > div > div:nth-child(3)").outerHTML += '<div class"col-sm-1"> <input type=checkbox id="mesdemandes"><b style="color:blue">Mes demandes seulement</b</input> </div>';

    scope.filtrer = filtrerMesDemandes
    scope.$apply();


}


function filtrerMesDemandes(idDemande, centreGestionFilter, typeDemandeFilter, activiteFilter) {
    var $scope = angular.element('.button-blue').scope().$parent.$parent ;
    console.log("§§§§§§§§§§§§§§§§§§§§§§§§§§§ filtrer : begin");

    console.log("typeDemandeFilter "+ typeDemandeFilter+ " activiteFilter " + activiteFilter);
    $scope.criteria.filterString = "";
    if (idDemande != null && idDemande != undefined && idDemande.trim() != "")
    {
        $scope.criteria.filterString += "attribute1 = " + idDemande + "";
    }
    if (typeDemandeFilter != null && typeDemandeFilter != undefined && typeDemandeFilter.trim() != "")
    {
        if ($scope.criteria.filterString != "")
            $scope.criteria.filterString += " AND ";
        $scope.criteria.filterString += "attribute2 = '" + typeDemandeFilter + "'";
    }

    if (activiteFilter != null && activiteFilter != undefined && activiteFilter.trim() != "")
    {
        if ($scope.criteria.filterString != "")
            $scope.criteria.filterString += " AND ";
        //           $scope.criteria.filterString += "attribute3 = '" + activiteFilter + "'";
        $scope.criteria.filterString += "attribute13 = '" + activiteFilter + "'"; // activite = attribute13
    }

    if(document.querySelector("#mesdemandes").checked)
    {
        if ($scope.criteria.filterString != "")
            $scope.criteria.filterString += " AND ";
        $scope.criteria.filterString = "state=OPENED";
    }

    if ($scope.criteria.filterString != undefined && $scope.criteria.filterString != null)
    {
        $scope.refreshTaskList();
    }
    console.log("§§§§§§§§§§§§§§§§§§§§§§§§§§§ filtrer : end");
};


(function(open) {
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("readystatechange", function() {

            if(this.responseURL.includes("https://acdc/bpm/rest/worklist/items/RESOURCE") && this.readyState ===4)
            {

                // customize button with number
                var result = JSON.parse(this.response);
                var totalItems = result["xml-fragment"].totalItems;
                document.getElementsByClassName("button")[0].textContent = "Filtrer total :"+totalItems;


                function setlibrePrise()
                {
                    var nbrelemts =  result["xml-fragment"].endPosition- result["xml-fragment"].startPosition +2
                    for(var itr=1;itr<nbrelemts;itr++)
                    {

                        var itemstatut = document.querySelector("body > div.layout-row.flex > div > div > tasks-section-directive > div > div:nth-child(2) > custom-task-page-directive > div > div > custom-task-list-directive > div > div > table > tbody > tr:nth-child("+itr+") > td:nth-child(1) > span");

                        if(itemstatut.parentNode.innerHTML.includes("LIBRE") || itemstatut.parentNode.innerHTML.includes("PRISE"))
                        {
                        }else
                        {
                            var statuttoadd =  (result["xml-fragment"].workItems[itr-1].state == "OPENED"?( "<b style='color:red'>PRISE</b>" ):( "<b style='color:green'>LIBRE</b>" ))
                            itemstatut.parentNode.innerHTML +=  statuttoadd;
                        }

                    }
                }
                setTimeout(setlibrePrise, 500);
                setTimeout(setlibrePrise, 1500);
                setTimeout(setlibrePrise, 3000);
            }

        });
        open.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);
