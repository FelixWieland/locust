import { createEffect, onCleanup, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { registerShortcut } from "../shortcut"
import { connection, latency, lastServerResponseTime, session } from "../store"
import { Options } from "../types"
import { LatencyIndicator } from "./LatencyIndicator"

type OptionPopupProps = {
    open: boolean
    onClose: () => void
    options: Options
    onOptionsChange?: (newOptions: Options) => void
}

function OptionsPopup(props: OptionPopupProps) {

    createEffect(() => {
        if (props.open) {
            document.body.style.overflow = 'hidden'
            registerShortcut('Escape', false, props.onClose)
        } else {
            document.body.style.overflow = 'auto'
        }
    })

    return (
        <Portal mount={document.body}>
            <div tabindex="-1" aria-hidden="true" class="z-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 w-screen md:inset-0 h-modal h-screen bg-black bg-opacity-60 flex items-center justify-center" classList={{
                'hidden': !props.open
            }}>
                <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
                    <div class="relative bg-white rounded shadow dark:bg-zinc-700">
                        <div class="flex justify-between items-start p-4 rounded-t border-b dark:border-zinc-600">
                            <h3 class="text-xl font-semibold text-zinc-900 dark:text-white">
                                Connection
                                <LatencyIndicator />
                            </h3>
                            <button type="button" class="text-zinc-400 bg-transparent hover:bg-zinc-200 hover:text-zinc-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-zinc-600 dark:hover:text-white" onClick={props.onClose}>
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                <span class="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div class="p-6 space-y-6">
                            <div>
                                <label for="endpoint" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">Endpoint</label>
                                <input
                                    type="text"
                                    id="endpoint"
                                    class="block p-2 w-full text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-300 sm:text-xs focus:ring-teal-700 focus:border-teal-700 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-teal-700 dark:focus:border-teal-700"
                                    disabled={!props.onOptionsChange}
                                    value={props.options.endpoint}
                                    onChange={(e) => props?.onOptionsChange!({
                                        ...props.options,
                                        endpoint: e.currentTarget.value
                                    })}
                                />
                            </div>
                            <div>
                                <label for="checked-toggle" class="inline-flex relative items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value="" id="checked-toggle"
                                        class="sr-only peer"
                                        checked={props.options.sessionAquire}
                                        disabled={!props.onOptionsChange}
                                        onChange={e => props?.onOptionsChange!({
                                            ...props.options,
                                            sessionAquire: e.currentTarget.checked
                                        })}
                                    />
                                    <div class="w-11 h-6 bg-zinc-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:bg-teal-700 dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-teal-700"></div>
                                    <span class="ml-3 text-sm font-medium text-zinc-900 dark:text-zinc-300">Session</span>
                                </label>
                            </div>
                            <div class="mt-1 border-zinc-200 dark:border-zinc-600 border-solid border-t"></div>
                            <div>
                                <div class="w-full flex flex-row gap-4">
                                    <div class="w-full">
                                        <label for="batch-ms" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">Batch ms</label>
                                        <input
                                            type="number"
                                            id="batch-ms"
                                            class="block p-2 w-full text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-300 sm:text-xs focus:ring-teal-700 focus:border-teal-700 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-teal-700 dark:focus:border-teal-700"
                                            disabled={true}
                                            value={0}
                                        />
                                    </div>
                                    <div class="w-full">
                                        <label for="debounce-ms" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">Debounce ms</label>
                                        <input
                                            type="number"
                                            id="debounce-ms"
                                            class="block p-2 w-full text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-300 sm:text-xs focus:ring-teal-700 focus:border-teal-700 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-teal-700 dark:focus:border-teal-700"
                                            disabled={true}
                                            value={0}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Show when={!!session()}>
                                <div class="mt-1 border-zinc-200 dark:border-zinc-600 border-solid border-t"></div>
                                <div>
                                    <div>
                                        <label for="session-token" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">Session-Token</label>
                                        <input
                                            type="text"
                                            id="session-token"
                                            class="block p-2 w-full text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-300 sm:text-xs focus:ring-teal-700 focus:border-teal-700 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-teal-700 dark:focus:border-teal-700"
                                            disabled={true}
                                            value={session()?.sessionToken || '-'}
                                        />
                                    </div>
                                    <div class="flex flex-row w-full">
                                        <div class="mt-3 mr-4">
                                            <label for="endpoint" class="block mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-300">Active connections</label>
                                            <span class="bg-teal-700 text-white text-sm font-medium mr-2 px-2.5 py-0.5 translate-y-2 rounded ">
                                                {session()?.activeConnections || 0}
                                            </span>
                                        </div>
                                        <div class="mt-3 mr-4">
                                            <label for="endpoint" class="block mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-300">Subscribed nodes</label>
                                            <span class="bg-teal-700 text-white text-sm font-medium mr-2 px-2.5 py-0.5 translate-y-2 rounded ">
                                                {session()?.subscribedNodesIDs?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Show>
                            <div class="w-full flex">
                                <p class="p-0 text-xs text-zinc-900 dark:text-zinc-300" style={{ 'margin-bottom': '-10px' }}>
                                    Latest server response: {lastServerResponseTime()?.toLocaleString() || '-'}
                                </p>
                                <div class="flex-grow"></div>
                                <p class="p-0 text-xs text-teal-700" style={{ 'margin-bottom': '-10px' }}>
                                    Powered by locust
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>

    )
}

export {
    OptionsPopup
}