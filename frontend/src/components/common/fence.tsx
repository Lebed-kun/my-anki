import React from "react";

const Fence: React.FC<{ visible: boolean }> = ({ visible, children }) => {
    return (
        <div style={{ display: (visible ? "block" : "none") }}>
            {children}
        </div>
    )
}

export default Fence;
