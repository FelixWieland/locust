import { createEffect, createSignal, onCleanup } from "solid-js"
import { ConnectionOptionPopup } from "./ConnectionOptionPopup";
import { connection } from "./store";
import { ConnectionOptions } from "./types";


type SidebarProps = {
    open: boolean
    options: ConnectionOptions
    onOptionsChange: (newOptions: ConnectionOptions) => void
}

function Sidebar(props: SidebarProps) {
    const [optionsPopupOpen, setOptionsPopupOpen] = createSignal(false)

    const setBodyPadding = () => {
        document.body.style.paddingLeft = '3rem';
    }

    const removeBodyPadding = () => {
        document.body.style.paddingLeft = '';
    }

    createEffect(() => {
        document.body.style.transitionProperty = 'padding'
        document.body.style.transitionTimingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)'
        document.body.style.transitionDuration = '150ms'
        if (props.open) {
            setBodyPadding();
        } else {
            removeBodyPadding();
        }
        onCleanup(() => removeBodyPadding());
    })

    return (
        <div
            class="fixed left-0 top-0 w-12 h-full dark:bg-zinc-800 bg-white shadow rounded-r pt-12 transition-all flex flex-col"
            classList={{ '-ml-12': !props.open }}
        >
            <div class="flex-1" />
            <div class="flex flex-col items-center mt-2">
                <div class="flex items-center justify-center w-8 h-8 mt-2 rounded hover:bg-zinc-200 cursor-pointer text-zinc-700" onClick={(() => setOptionsPopupOpen(true))}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
                    </svg>
                </div>
            </div>
            <div class="mb-1 mt-1">

            </div>
            <ConnectionOptionPopup
                open={optionsPopupOpen()}
                onClose={() => setOptionsPopupOpen(false)}
                options={props.options}
                onOptionsChange={props.onOptionsChange}
            />
        </div>
    )
}

export {
    Sidebar
}