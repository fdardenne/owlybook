/** @odoo-module */

function formatValueForAttrs(value) {
    if (value === false || value === true) {
        return value;
    }
    return `'${value}'`;
}

export function attrsToXml(attrs) {
    let xml = "";
    const subAttrs = {};

    for (const attribute in attrs) {
        const splittedAttribute = attribute.split(".");
        const value = attrs[attribute].value;

        if (splittedAttribute.length !== 2 && value !== undefined) {
            // Inject the normal attributes
            xml += `${attribute}="${value}" `;
        } else if (splittedAttribute.length === 2 && value !== undefined) {
            // Constitute a datastructure for sub attributes
            if (!subAttrs[splittedAttribute[0]]) {
                subAttrs[splittedAttribute[0]] = {};
            }
            subAttrs[splittedAttribute[0]][splittedAttribute[1]] = value;
        }
    }

    // Loop to inject the sub attributes
    for (const attribute in subAttrs) {
        let attributeStr = `${attribute}="{`;
        for (const subAttribute in subAttrs[attribute]) {
            let subValue = subAttrs[attribute][subAttribute];
            subValue = formatValueForAttrs(subValue);
            attributeStr += `'${subAttribute}':${subValue},`;
        }
        attributeStr = attributeStr.slice(0, -1); // remove the last ,
        attributeStr += `}"`;
        xml += attributeStr;
    }

    return xml;
}

export function arrayToSelectMenuArray(choices) {
    return choices?.map((value) => {
        if (typeof value !== "object") {
            return { value, label: value };
        } else {
            return value;
        }
    });
}
