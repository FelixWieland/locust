import { createEffect } from "solid-js"

interface ControlledInputProps {
    value: any,
    onChange: (v: string) => void
    disabled: boolean
}

function ControlledInput(props: ControlledInputProps) {
    let ref: HTMLInputElement | null | undefined;
    return <input
        ref={ref}
        type="text"
        id="endpoint"
        class="block p-2 w-full text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-300 sm:text-xs focus:ring-teal-700 focus:border-teal-700 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-teal-700 dark:focus:border-teal-700"
        disabled={props.disabled}
        value={props.value}
        onInput={(e) => {
            props.onChange(e.currentTarget.value)
        }}
    />

}

export {
    ControlledInput
}