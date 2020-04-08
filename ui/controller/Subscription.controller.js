sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Filter',
    'sap/pregis/sample/app/ui/controller/Util',
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, JSONModel, Filter, Util, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("sap.pregis.sample.app.ui.controller.Subscription", {

        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("subscriptions").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this.getView().setModel(new JSONModel({items: []}), "commandList");
            this.getView().setModel(new JSONModel({items: []}), "ackList");
            this.getCommandData();
            this.getAckData();
        },

        onRefreshCommandList: function () {
            this.getCommandData();
        },

        onRefreshAckList: function () {
            this.getAckData();
        },

        getCommandData: function () {
            var that = this;
            $.getJSON("/presets")
                .done(function (data) {
                    that.getView().getModel("commandList").setData(data);
                })
                .fail(function (oXhr) {
                    that.getView().getModel("commandList").setData([]);
                    MessageBox.error("Error in Getting Commands", {
                        actions: [MessageBox.Action.CLOSE],
                        details: oXhr.responseText
                    });
                });
        },

        getAckData: function () {
            var that = this;
            $.getJSON("/ack")
                .done(function (data) {
                    that.getView().getModel("ackList").setData(data);
                })
                .fail(function (oXhr) {
                    that.getView().getModel("ackList").setData([]);
                    MessageBox.error("Error in Getting Commands", {
                        actions: [MessageBox.Action.CLOSE],
                        details: oXhr.responseText
                    });
                });
        },

        formatCommand : function(command){
            return JSON.stringify(command);
        }
    });

});