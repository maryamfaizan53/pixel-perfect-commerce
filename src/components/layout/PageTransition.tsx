import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: isMobile ? 10 : 30, filter: isMobile ? "none" : "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "none" }}
            exit={{ opacity: 0, y: isMobile ? -10 : -30, filter: isMobile ? "none" : "blur(10px)" }}
            transition={{
                duration: isMobile ? 0.3 : 0.6,
                ease: [0.22, 1, 0.36, 1]
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};
