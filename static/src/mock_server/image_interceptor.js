/**
 * Images of records are loaded from the server: `<img src="/web/image/...">`.
 * For the records of the mock server, that would show the record of the same
 * id in the real database, or nothing when there is no server. This replaces
 * those urls with the image of the fake record, as a data url.
 */
import { getMockServer } from "./rpc_interceptor";

const IMAGE_FIELD = /^(image|avatar)_\d+$/;

/**
 * "/web/image/hr.employee/3/avatar_128" or "/web/image?model=...&id=...&field=..."
 *
 * @returns {{ model: string, id: number, field: string } | null}
 */
function parseImageUrl(src) {
    const url = new URL(src, "http://owlybook");
    if (!url.pathname.startsWith("/web/image")) {
        return null;
    }
    const parts = url.pathname.split("/").slice(3);
    const model = url.searchParams.get("model") || parts[0];
    const id = Number(url.searchParams.get("id") || parts[1]);
    const field = url.searchParams.get("field") || parts[2] || "image_1920";
    return model && id ? { model, id, field } : null;
}

/**
 * The image of a fake record: the requested field, or another image field of
 * the record (an avatar_128 is a resized image_1920).
 */
function getRecordImage(server, { model, id, field }) {
    const modelData = server.models[model];
    const record = modelData && server.getRecord(modelData, id);
    if (!record) {
        return null;
    }
    const candidates = [field, ...Object.keys(modelData.fields).filter((name) => IMAGE_FIELD.test(name))];
    const value = candidates.map((name) => record[name]).find((data) => typeof data === "string" && data);
    return value ? `data:image/png;base64,${value}` : null;
}

function replaceImage(img) {
    const server = getMockServer();
    const src = img.getAttribute("src");
    if (!server || !src || src.startsWith("data:")) {
        return;
    }
    const target = parseImageUrl(src);
    const dataUrl = target && getRecordImage(server, target);
    if (dataUrl) {
        img.setAttribute("src", dataUrl);
    }
}

export function installImageInterceptor() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === "attributes") {
                replaceImage(mutation.target);
            }
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }
                if (node.tagName === "IMG") {
                    replaceImage(node);
                }
                for (const img of node.querySelectorAll("img")) {
                    replaceImage(img);
                }
            }
        }
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["src"],
    });
}
