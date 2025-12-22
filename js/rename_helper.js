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
                            let hours = now.getHours();
                            let formattedHours12 = hours % 12 || 12;

                            return format
                                .replace(/yyyy/g, now.getFullYear())
                                .replace(/yy/g, String(now.getFullYear()).slice(-2))
                                .replace(/MM/g, String(now.getMonth() + 1).padStart(2, '0'))
                                .replace(/M/g, String(now.getMonth() + 1))
                                .replace(/dd/g, String(now.getDate()).padStart(2, '0'))
                                .replace(/d/g, String(now.getDate()))
                                .replace(/hh/g, String(formattedHours12).padStart(2, '0'))
                                .replace(/h/g, String(formattedHours12))
                                .replace(/mm/g, String(now.getMinutes()).padStart(2, '0'))
                                .replace(/m/g, String(now.getMinutes()))
                                .replace(/ss/g, String(now.getSeconds()).padStart(2, '0'))
                                .replace(/s/g, String(now.getSeconds()));
                        });

                        val = val.replace(/%date%/g, () => {
                            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                        });

                        val = val.replace(/%([^%]+)\.([^%]+)%/g, (match, nodeTitleOrId, widgetName) => {
                            const targetTitle = nodeTitleOrId.trim();
                            const targetWidgetName = widgetName.trim();

                            let targetNode = app.graph._nodes.find(n =>
                                (n.title && n.title.trim() === targetTitle) ||
                                (n.id && n.id.toString() === targetTitle)
                            );

                            if (targetNode) {
                                const targetWidget = targetNode.widgets?.find(w => w.name === targetWidgetName);
                                if (targetWidget) {
                                    return String(targetWidget.value);
                                }
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