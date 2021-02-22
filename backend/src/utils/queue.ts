// Number of items which signals to reallocate space for queue's items after pops
const DEFAULT_REALLOC_FACTOR = 50;

export class Queue<T> {
    private _items: T[];
    private readonly _reallocFactor: number;
    private _count: number;
    private _qPointer: number;

    constructor(
        reallocFactor: number = DEFAULT_REALLOC_FACTOR,
        initItems?: T[]
    ) {
        this._reallocFactor = reallocFactor;
        this._items = initItems ?? [];
        this._count = this._items.length;
        this._qPointer = 0;
    }

    public push(item: T) {
        this._items.push(item);
        this._count++;
    }

    public pop(): T | undefined {
        if (this._count < 1) return undefined;
        
        const item = this._items[this._qPointer++];
        this._count--;

        const itemsLeft = this._items.length - this._count;

        if (itemsLeft >= this._reallocFactor) {
            const newItems: T[] = [];

            for (let i = this._qPointer; i < this._items.length; i++) {
                newItems.push(this._items[i]);
            }

            this._items = newItems;
            this._count = this._items.length;
            this._qPointer = 0;
        }

        return item;
    }

    public peek(): T | undefined {
        return this._items[this._qPointer];
    }

    public get count(): number {
        return this._count;
    }
}