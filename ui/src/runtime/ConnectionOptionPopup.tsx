import { createEffect, onCleanup } from "solid-js"
import { Portal } from "solid-js/web"
import { ConnectionOptions } from "./types"

type ConnectionOptionPopupProps = {
    open: boolean
    onClose: () => void
    options: ConnectionOptions
    onOptionsChange?: (newOptions: ConnectionOptions) => void
}

function ConnectionOptionPopup(props: ConnectionOptionPopupProps) {

    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            props.onClose()
        }
    }

    createEffect(() => {
        if (props.open) {
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', onKeyDown);
        } else {
            document.body.style.overflow = 'auto'
            document.removeEventListener('keydown', onKeyDown)
        }
    })

    onCleanup(() => {
        document.removeEventListener('keydown', onKeyDown)
    })

    return (
        <Portal mount={document.body}>
            <div tabindex="-1" aria-hidden="true" class="z-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 w-screen md:inset-0 h-modal h-screen bg-black bg-opacity-60 flex items-center justify-center" classList={{
                'hidden': !props.open
            }}>
                <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
                    <div class="relative bg-white rounded shadow dark:bg-gray-700">
                        <div class="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                Connection options
                            </h3>
                            <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={props.onClose}>
                                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                <span class="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div class="p-6 space-y-6">
                            <div>
                                <label for="endpoint" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Endpoint</label>
                                <input
                                    type="text"
                                    id="endpoint"
                                    class="block p-2 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    disabled={!props.onOptionsChange}
                                    value={props.options.endpoint}
                                    onChange={(e) => props?.onOptionsChange({
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
                                        checked={props.options.session}  
                                        disabled={!props.onOptionsChange}
                                        onChange={e => props?.onOptionsChange({
                                            ...props.options,
                                            session: e.currentTarget.checked
                                        })}
                                    />
                                        <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:bg-teal-700 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-700"></div>
                                        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Session</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>

    )
}

export {
    ConnectionOptionPopup
}