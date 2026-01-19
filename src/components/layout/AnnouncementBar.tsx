import { motion } from "framer-motion";
import { Truck, Info } from "lucide-react";

export const AnnouncementBar = () => {
    return (
        <div className="bg-primary overflow-hidden border-b border-primary/20">
            <div className="container-custom relative">
                <div className="flex items-center justify-center min-h-[40px] py-2 px-4 gap-4 text-center md:gap-8 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2 text-primary-foreground font-medium text-xs sm:text-sm tracking-tight"
                    >
                        <Truck className="w-4 h-4 animate-bounce" />
                        <span className="uppercase tracking-widest font-bold">Delivery charges 200/- Rupees</span>
                    </motion.div>

                    <div className="hidden md:block w-px h-4 bg-primary-foreground/20" />

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-2 text-primary-foreground font-medium text-xs sm:text-sm tracking-tight"
                    >
                        <Info className="w-4 h-4" />
                        <span className="font-bold">ALLOWED TO OPEN PARCEL BEFORE PAYMENT</span>
                    </motion.div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-primary-foreground/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-primary-foreground/10 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};
