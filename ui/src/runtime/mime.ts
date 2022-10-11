import { Any } from './api/google/protobuf/any';
import {
    allNodeDataMimeTypes,
    NodeDataMimeTypes
} from './types'

class Serialize {
    static raw(data: any, mimeType: NodeDataMimeTypes = ''): Any {
        let text: string = ''
        switch (typeof data) {
            case 'number': {
                text = data.toString();
                break;
            }
            case 'boolean': {
                text = data ? 'true' : 'false'
                break;
            }
            case 'object': {
                text = JSON.stringify(data)
                break;
            }
            case 'string': {
                text = data;
                break;
            }
            default: {
                text = `${data}`
                break;
            }
        }
        return {
            typeUrl: mimeType,
            value: new TextEncoder().encode(text),
        }
    }

    static text(data: string): Any {
        return {
            typeUrl: "string",
            value: new TextEncoder().encode(data)
        }
    }

    static number(data: number): Any {
        return {
            typeUrl: "number",
            value: new TextEncoder().encode(data.toString())
        }
    }

    static boolean(data: boolean): Any {
        return {
            typeUrl: "boolean",
            value: new TextEncoder().encode(data ? 'true' : 'false')
        }
    }

    static json(data: object): Any {
        return {
            typeUrl: "json",
            value: new TextEncoder().encode(JSON.stringify(data))
        }
    }

    static textCsv(data: string): Any {
        return {
            typeUrl: "text/csv",
            value: new TextEncoder().encode(data)
        }
    }

    static textJavascript(data: string): Any {
        return {
            typeUrl: "text/javascript",
            value: new TextEncoder().encode(data)
        }
    }

    static textHtml(data: string): Any {
        return {
            typeUrl: "text/html",
            value: new TextEncoder().encode(data)
        }
    }

    static applicationXml(data: XMLDocument): Any {
        return {
            typeUrl: "application/xml",
            value: new TextEncoder().encode(new XMLSerializer().serializeToString(data))
        }
    }

    static imageJpeg(data: any) {
        return {
            typeUrl: "image/jpeg",
            value: new Uint8Array()
        }
    }

    static imagePng(data: any) {
        return {
            typeUrl: "image/png",
            value: new Uint8Array()
        }
    }

    static imageSvgXml(data: SVGElement) {
        return {
            typeUrl: "text/svg+xml",
            value: new TextEncoder().encode(new XMLSerializer().serializeToString(data))
        }
    }
}

class Parse {
    static raw(data: Any): Uint8Array {
        return data.value
    }

    static text(data: Any): string {
        return new TextDecoder().decode(data.value)
    }

    static number(data: Any): number {
        return Number(new TextDecoder().decode(data.value));
    }

    static boolean(data: Any): boolean {
        return new TextDecoder().decode(data.value) === 'true'
    }

    static json<T>(data: Any): T {
        return JSON.parse(new TextDecoder().decode(data.value))
    }

    static textCsv(data: Any): string {
        return new TextDecoder().decode(data.value)
    }

    static textJavascript(data: Any): string {
        return new TextDecoder().decode(data.value)
    }

    static textHtml(data: Any): string {
        return new TextDecoder().decode(data.value)
    }

    static applicationXml(data: Any): XMLDocument {
        return new DOMParser().parseFromString(new TextDecoder().decode(data.value), 'application/xml')
    }

    static imageJpeg(data: Any): Uint8Array {
        return data.value
    }

    static imagePng(data: Any): Uint8Array {
        return data.value
    }

    static imageSvgXml(data: Any): SVGElement {
        return new DOMParser().parseFromString(new TextDecoder().decode(data.value), 'image/svg+xml') as unknown as SVGElement
    }
}

export {
    Serialize,
    Parse
}