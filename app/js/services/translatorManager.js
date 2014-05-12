'use strict';
/**
 * Translator Manager Factory
 * A factory to manage translation of GSBL -> JSON and JSON -> SPARQL
 *
 */

angular.module('GSB.services.translatorManager', ['GSB.config'])
  .factory('TranslatorManager', ['$log', 'globalConfig', '$rootScope', 'TranslatorToJSON', 'TranslatorToSPARQL', function ($log, globalConfig, $rootScope, TranslatorToJSON, TranslatorToSPARQL) {
    var factory = {};


   /**
    *  Function initiates JSON-saving
    */
    factory.prepareSaveLink = function (mainSubjectSelected, subjects) {

        var json = TranslatorToJSON.translateGSBLToJSON(mainSubjectSelected, subjects);

        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.download    = "query.json";
        a.href        = url;
        a.textContent = "Download query.json";

        if(document.getElementById("saveLink").firstChild == null)
                {document.getElementById('saveLink').appendChild(a);}
        else
        {document.getElementById('saveLink').replaceChild(a, document.getElementById("saveLink").firstChild);}

    }


        /**
         *  Function will load JSON-file as query
         */
        factory.loadJSON = function (mainSubjectSelected, subjects) {

           alert("Soon you'll be able to open a local JSON file representing a query with this button.");

        }



     /**
     *  Function first calls the factory to translate GSBL to JSON, then the one to translate JSON to SPARQL
     */
    factory.translateGSBLToSPARQL = function (mainSubjectSelected, subjects) {
    
      $log.info('Managing translation from GSBL to SPARQL');
	  
	  var newJSON = TranslatorToJSON.translateGSBLToJSON(mainSubjectSelected, subjects);
	  $rootScope.$broadcast('JSONUpdateEvent', newJSON);
	  
	
      if (newJSON == null) {
        $log.error("JSON is not valid / empty");
        return;
      }
	  
	  
	  var newSPARQL = TranslatorToSPARQL.translateJSONToSPARQL(JSON.parse(newJSON));
	   $rootScope.$broadcast('SPARQLUpdateEvent', newSPARQL);
	   
   
    };
	

	
    return factory;

  }]);
