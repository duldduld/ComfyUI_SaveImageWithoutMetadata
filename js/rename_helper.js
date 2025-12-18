import { app } from "../../../scripts/app.js";

app.registerExtension({
    name: "ComfyUI.SaveImageWithoutMetadata",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name === "ComfyUI_SaveImageWithoutMetadata") {
            nodeType.prototype.isOutputNode = true;

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                onNodeCreated?.apply(this, arguments);
                const widget = this.widgets?.find(w => w.name === "filename_prefix");
                
                if (widget) {
                    widget.type = "STRING";
                    
                    widget.serializeValue = function() {
                        let val = widget.value;
                        if (!val || typeof val !== "string") return val;

                        const now = new Date();

                        val = val.replace(/%date:([^%]+)%/g, (match, format) => {
                            return format
                                .replace(/yyyy/g, now.getFullYear())
                                .replace(/MM/g, String(now.getMonth() + 1).padStart(2, '0'))
                                .replace(/dd/g, String(now.getDate()).padStart(2, '0'))
                                .replace(/hh/g, String(now.getHours()).padStart(2, '0'))
                                .replace(/mm/g, String(now.getMinutes()).padStart(2, '0'))
                                .replace(/ss/g, String(now.getSeconds()).padStart(2, '0'));
                        });

                        val = val.replace(/%date%/g, () => {
                            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                        });

                        val = val.replace(/%([^% \.]+)\.([^% \.]+)%/g, (match, nodeTitleOrId, widgetName) => {
                            let targetNode = app.graph._nodes.find(n => n.title === nodeTitleOrId || n.id == nodeTitleOrId);
                            if (targetNode) {
                                const targetWidget = targetNode.widgets?.find(w => w.name === widgetName);
                                if (targetWidget) return targetWidget.value;
                            }
                            return match;
                        });

                        return val;
                    };
                }
            };
        }
    }
});