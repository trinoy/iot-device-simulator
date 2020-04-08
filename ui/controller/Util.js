sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/m/MessageBox", 
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat"
], function(Fragment, MessageBox, Filter, FilterOperator, DateFormat) {

    "use strict";

    return {
        // generic method to open a dialog with a given id and fragment name
        openDialog: function (sDialogId, sFragmentName, context) {
            var that = context;
            var oView = that.getView();
            // create dialog lazily
            if (!that.byId(sDialogId)) {
                // load asynchronous XML fragment
                Fragment.load({
                    id: oView.getId(),
                    name: "sap.pregis.sample.app.ui.view." + sFragmentName,
                    controller: that
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                that.byId(sDialogId).open();
            }
        },

        //generic method to clear fields of user input controls
        resetInputValues: function (aIds, context) {
            if (aIds && context && context.getView) {
                aIds.forEach(function (sId) {
                    var oControl =  context.getView().byId(sId);
                    var sClassName = oControl ? oControl.getMetadata().getElementName() : null;
                    if (oControl && sClassName) {
                        if (sClassName === "sap.m.Input" || sClassName === "sap.m.DatePicker") {
                            oControl.setValue(null);
                        } else if (sClassName === "sap.m.Select") {
                            oControl.setSelectedKey("");
                        } else if (sClassName === "sap.ui.unified.FileUploader") {
                            oControl.clear();
                        } else if (sClassName === "sap.m.ComboBox") {
                            oControl.clearSelection();
                            oControl.setValue(null);
                        }
                    }
                });
            }
        }
    };
});