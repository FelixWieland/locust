import { onCleanup } from "solid-js";
import { StreamResponse } from "./api/messages";


function assure(response: StreamResponse, kind: string): boolean {
    return response.data.oneofKind === kind && (response.data as unknown as any)[kind]
}

export {
    assure
}