import { createEffect, onCleanup } from "solid-js"


type SidebarProps = {
    open: boolean
}

function Sidebar(props: SidebarProps) {

    const setBodyPadding = () => {
        document.body.style.paddingLeft = '3.5rem';
    }

    const removeBodyPadding = () => {
        document.body.style.paddingLeft = '';
    }

    createEffect(() => {
        if (props.open) {
            setBodyPadding();
        } else {
            removeBodyPadding();
        }
        onCleanup(() => removeBodyPadding());
    })
    return (
        <div 
            class="fixed left-0 top-0 w-12 h-full dark:bg-zinc-800 bg-white shadow rounded-r pt-12 transition-all" 
            classList={{ '-ml-12': !props.open }}
        >
            
        </div>
    )
}

export {
    Sidebar
}