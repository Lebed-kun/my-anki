class RandStack<T> {
    private _stack: T[];
    
    constructor(list: T[]) {
        this._stack = list;
    }

    public push(item: T) {
        this._stack.push(item);
    }

    public pop(): T | undefined {
        if (this._stack.length === 0) {
            return undefined;
        }

        const randId = (Math.random() * (this._stack.length - 1)) ^ 0;

        const temp = this._stack[this._stack.length - 1];
        this._stack[this._stack.length - 1] = this._stack[randId];
        this._stack[randId] = temp;

        return this._stack.pop();
    }

    public peek(): T | undefined {
        return this._stack[this._stack.length - 1];
    }

    public length(): number {
        return this._stack.length;
    }
}

export default RandStack;
