export interface Transition {
    condition: (src: string, id: number) => boolean;
    nextState: number;
    effect?: (src: string, id: number) => void;
}

export interface TransitionDict {
    [state: number]: Transition[];
}

export class Fsm {
    private _initState: number;
    private _transitionTable: TransitionDict;

    constructor(
        initState: number,
        transitionTable: TransitionDict = {}
    ) {
        this._initState = initState;
        this._transitionTable = transitionTable;
    }

    public addTransition(fromState: number, transition: Transition) {
        if (!this._transitionTable[fromState]) {
            this._transitionTable[fromState] = [];
        }

        this._transitionTable[fromState].push(transition);
    }

    public proceed<M>(
        str: string, 
        begin: number, 
        handleRecognizeError: (str: string, id: number) => M,
        initState?: number
    ) {
        let state = initState ?? this._initState;
        let i = begin;

        while (i <= str.length) {
            let recognized = false;
            const transitions = this._transitionTable[state];
            
            for (let trs of transitions) {
                if (trs.condition(str, i)) {
                    recognized = true;
                    state = trs.nextState;
                    trs.effect?.(str, i);
                    break;
                }
            }

            if (!recognized && i < str.length) {
                handleRecognizeError(str, i);
                return;
            }

            i++;
        }
    }
}
