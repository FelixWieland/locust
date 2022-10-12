
type FlushFn<T, R> = (batch: Array<T>) => R

class Batcher<T, R> {
    private _batchMs: number;
    private _debounceMs: number;

    private _batch: Array<T>;
    
    private _onFlush: FlushFn<T, R>;

    private _currentBatchTimeout: number | null;
    private _currentDebounceTimeout: number | null;

    /**
     * ## Batcher
     * @param onFlush - The function called when the batch timeout or the debounce timeout runs
     * @param afterMs - After this amount of time the onFlush function gets run. If this is 0 items get flushed instantly
     * @param debounceMs - Debounce ms needs to be smaller then afterMs to take effect. 
     * If a item gets added and no new item gets added to the buffer in the given debounce time the flush function runs instantly. 
     * If items get added in the given debounc time the items get flushed after the batch interval. If this is set to 0 it doesnt take effect.
     */
    constructor(onFlush: FlushFn<T, R>, batchMs: number=0, debounceMs: number=0) {
        this._onFlush = onFlush;
        this._batchMs = batchMs;
        this._debounceMs = debounceMs;
        this._currentBatchTimeout = null;
        this._currentDebounceTimeout = null;
        this._batch = [];
    }

    public setBatchMs(ms: number) {
        this._batchMs = ms
    }

    public setDebounceMs(ms: number) {
        this._debounceMs = ms
    }

    public push(...items: T[]) {
        if (this._batchMs === 0) {
            this.flush(items)
        }
        if (this._currentBatchTimeout === null) {
            this.startBatchTimeout()
        }
        if (this._batchMs > this._debounceMs && this._debounceMs > 0) {
            this.debounce()
        }
        this._batch.push(...items)
    }

    private startBatchTimeout() {
        this._currentBatchTimeout = setTimeout(() => {
            const items = [...this._batch]
            this._batch = []
            this._currentBatchTimeout = null
            this.flush(items)
        }, this._batchMs)
    }

    private debounce() {
        if (this._currentDebounceTimeout !== null) {
            clearTimeout(this._currentDebounceTimeout)
            this._currentDebounceTimeout = null
        }
        this._currentDebounceTimeout = setTimeout(() => {
            const items = [...this._batch]
            this._batch = []
            if (this._currentBatchTimeout !== null) {
                clearTimeout(this._currentBatchTimeout)
                this._currentBatchTimeout = null
            }
            this.flush(items)
        }, this._debounceMs)
    }

    private flush(items: Array<T>) {
        if (items.length === 0) {
            return
        }
        try {
            this._onFlush(items)
        } catch {}
    }
}

export {
    Batcher
}