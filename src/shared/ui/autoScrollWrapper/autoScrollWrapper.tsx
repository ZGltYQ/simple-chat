import { useEffect, useRef } from "react";


export default function AutoScrollWrapper({ children }: { children: React.ReactNode }) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrapperRef.current) return;

        wrapperRef.current.scrollTo({
            top: wrapperRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [ wrapperRef, children ])

    return (
        <div
            ref={wrapperRef}
            style={{ 
                display: 'flex', 
                flexDirection: 'column',
                padding: 20, 
                rowGap: 20, 
                flexGrow: 1, 
                overflowY: 'auto' 
            }
        }>
            {children}
        </div>
    )
}