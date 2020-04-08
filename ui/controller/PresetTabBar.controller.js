sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Filter',
    'sap/pregis/sample/app/ui/controller/Util',
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, JSONModel, Filter, Util, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("sap.pregis.sample.app.ui.controller.PresetTabBar", {

         SENSOR_ALTERNATE_ID: "root",
         CAPABILITY_ALTERNATE_ID: "smart_bagger_packing_spec_ack",

        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("presets").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this.getView().setModel(new JSONModel({items: []}), "presetList");
            this.getData();
        },

        onRefreshPresets: function () {
            this.getData();
        },

        getData: function () {
            var that = this;
            $.getJSON("/presets")
                .done(function (data) {
                    that.getView().getModel("presetList").setData(data);
                })
                .fail(function (oXhr) {
                    that.getView().getModel("presetList").setData([]);
                    MessageBox.error("Error in Getting Presets", {
                        actions: [MessageBox.Action.CLOSE],
                        details: oXhr.responseText
                    });
                });
        },

        isJson: function (str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        },

        getPayload: function (oEvent) {
            var that = this;
            var oCtx = oEvent.getSource().getBindingContext("presetList"),
                oControl = oEvent.getSource();
            var prettyPayload;
            var payload = oCtx.getProperty("command").payload;
            if(this.isJson(payload)){
                var payloadJson = JSON.parse(payload);
                prettyPayload = JSON.stringify(payloadJson, undefined, 4);
            }
            else{
                prettyPayload = payload;
            }
            var oModel = this.getView().getModel("presetList");
            oModel.setProperty(oCtx.getPath() + "/prettyPayload", prettyPayload, false);
            if (!this._oPopoverSocket) {
                Fragment.load({
                    id: "popupPreset",
                    name: "sap.pregis.sample.app.ui.view.Payload",
                    controller: this
                }).then(function (oPopover) {
                    this._oPopoverSocket = oPopover;
                    this.getView().addDependent(this._oPopoverSocket);
                    this._oPopoverSocket.bindElement({path: oCtx.getPath(), model: "presetList"});
                    this._oPopoverSocket.openBy(oControl);
                }.bind(this));
            } else {
                this._oPopoverSocket.bindElement({path: oCtx.getPath(), model: "presetList"});
                this._oPopoverSocket.openBy(oControl);
            }
        },

        getPayloadEncoded: function (oEvent) {
            var that = this;
            var oCtx = oEvent.getSource().getBindingContext("presetList"),
                oControl = oEvent.getSource();
            var prettyPayload;
            var payload = oCtx.getProperty("command").payload;
            var decodedString = atob(payload);
            if(this.isJson(decodedString)){
                var payloadJson = JSON.parse(decodedString);
                prettyPayload = JSON.stringify(payloadJson, undefined, 4);
            }
            else{
                prettyPayload = decodedString;
            }
            var oModel = this.getView().getModel("presetList");
            oModel.setProperty(oCtx.getPath() + "/prettyPayload", prettyPayload, false);
            if (!this._oPopover) {
                Fragment.load({
                    id: "popupPreset",
                    name: "sap.pregis.sample.app.ui.view.Payload",
                    controller: this
                }).then(function (oPopover) {
                    this._oPopover = oPopover;
                    this.getView().addDependent(this._oPopover);
                    this._oPopover.bindElement({path: oCtx.getPath(), model: "presetList"});
                    this._oPopover.openBy(oControl);
                }.bind(this));
            } else {
                this._oPopover.bindElement({path: oCtx.getPath(), model: "presetList"});
                this._oPopover.openBy(oControl);
            }
        },

        convertAckToBoolean : function(ackString){
            return (ackString == "Yes") ? true : false;
        },

        onAcknowledgeFormSave: function () {
            var that = this;
            var oView = this.getView();
            var empId = this.getView().byId("employeeId").getValue();
            var packingSpecId = this.getView().byId("packingSpecId").getValue();
            var ackSelect = this.getView().byId("ackSelect").getSelectedKey();
            var ackBoolean = this.convertAckToBoolean(ackSelect);
            var lastData = {
                employee_id: empId,
                packing_spec_id: packingSpecId,
                acknowledge:ackBoolean
            };
            var payload = {
                sensorAlternateId: this.SENSOR_ALTERNATE_ID,
                capabilityAlternateId: this.CAPABILITY_ALTERNATE_ID,
                measures: [
                    lastData.employee_id, lastData.packing_spec_id, lastData.acknowledge
                ]
            };
            var oDialog = this.byId("createAckDialog");
            oDialog.setBusy(true);
            var that = this;
            $.ajax({
                url: "/ack",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(payload),
                processData: false
            }).done(function (oData) {
                oDialog.setBusy(false);
                that.onCancelAckDialog();
            }).fail(function (oXhr) {
                oDialog.setBusy(false);
                that.onCancelAckDialog();
                MessageBox.error("Could not Post acknowledgement.", {
                    actions: [MessageBox.Action.CLOSE],
                    details: oXhr.responseText
                });
            });
        },

        // press event handler for add work instruction button. Open create dialog
        onOpenAckDialog: function (oEvent) {
            Util.openDialog("createAckDialog", "CreateAck",this);
        },

        onCancelAckDialog : function(){
            this.byId("createAckDialog").close();
        },

        onDeleteAll : function(){
            var that = this;
            MessageBox.warning(
                "This will delete all the presets. Do you want to proceed ?",
                {
                    actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                    onClose: function (sAction) {
                        if (sAction == "YES") {
                            var oTable = that.getView().byId("presetTable");
                            oTable.setBusy(true);
                            $.ajax({
                                url: "/deleteAll",
                                method: "GET",
                                success: function () {
                                    that.getView().getModel("presetList").setData([]);
                                    oTable.setBusy(false);
                                },
                                error: function (oXhr) {
                                    oTable.setBusy(false);
                                    MessageBox.error("Error while deleting presets.", {
                                        actions: [MessageBox.Action.CLOSE],
                                        details: oXhr.responseText
                                    });
                                }
                            });
                        }
                    }
                }
            );
        },

        beforeCloseAckDialog : function(){
            Util.resetInputValues([
                "employeeId",
                "packingSpecId"
            ], this);
        },

        handlePopUpClose: function () {
            this._oPopover.close();
        },

    });

});