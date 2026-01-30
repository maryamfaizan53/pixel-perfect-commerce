
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const ConsentBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const updateConsent = (granted: boolean) => {
        const state = granted ? 'granted' : 'denied';

        // Update GA4 Consent Mode
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': state,
                'ad_user_data': state,
                'ad_personalization': state,
                'analytics_storage': state
            });
        }

        // Save to localStorage
        localStorage.setItem('cookie_consent', state);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/95 backdrop-blur-sm border-t shadow-lg animate-in slide-in-from-bottom-full duration-500">
            <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 pr-8">
                    <h3 className="text-lg font-semibold mb-2">We respect your privacy</h3>
                    <p className="text-sm text-muted-foreground">
                        We use cookies to analyze website traffic and optimize your website experience.
                        By accepting our use of cookies, your data will be aggregated with all other user data.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => updateConsent(false)}
                        className="flex-1 md:flex-none"
                    >
                        Decline
                    </Button>
                    <Button
                        onClick={() => updateConsent(true)}
                        className="flex-1 md:flex-none"
                    >
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    );
};
