sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/routing/HashChanger"
], function (UIComponent, JSONModel, MessageBox,HashChanger) {
	"use strict";

	return UIComponent.extend("sap.pregis.sample.app.ui.Component", {
		metadata : {
			manifest: "json"
		},
		init : function () {
			HashChanger.getInstance().replaceHash("");
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		},

	});
});
