import { useState } from "react";

export const useForceUpdate = () => {
    const [flag, setFlag] = useState(false);
    return () => setFlag(!flag);
}