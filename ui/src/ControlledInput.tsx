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
        class="block p-2 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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