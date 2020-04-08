sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Fragment, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("sap.pregis.sample.app.ui.controller.Main", {

        onInit: function () {
        },

        // press event handler for side navigation collapse/expand button
        onSideNavButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();
            this.setToggleButtonTooltip(bSideExpanded);
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        // select event handler for side navigation menu item
        onSideNavigationItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo(oItem.getKey());
        },

        // change toggle button tooltip based on collapsed/ expanded state
        setToggleButtonTooltip: function (bLarge) {
            var oToggleButton = this.byId("sideNavigationToggleButton");
            if (bLarge) {
                oToggleButton.setTooltip("Large Size Navigation");
            } else {
                oToggleButton.setTooltip("Small Size Navigation");
            }
        },

    });
});
