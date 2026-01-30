
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');

const handles = [
    "micro-fiber-hair-cap-towel-pack-of-3",
    "leak-proof-spray-leakage-seal-rapid-stop-leaking-water-proof-spray",
    "nova-kemei-professional-hair-straightener-for-women-men",
    "finishing-touch-yes-hair-remover-machine-portable-rechargeable-yes-hair-remover-painless-epilator-shaver-for-women-featuring-usb-charging-underarm-body-hair-removal",
    "blackhead-remover",
    "knee-massager-chargeable",
    "non-stick-teflon-iron-cover-protector-iron-plate-protector-anti-scorch-heat-resistant-protects-fabrics-prevents-burns-stains-easy-to-use-long-lasting",
    "portable-mini-steam-iron-garment-steamer-professional-handheld-micro-ironing-machine-for-dry-wet-use-rotatable-handle-for-home-and-travel",
    "bike-handlebar-waterproof-case-phone-holder-full-touch-screen-secure-mount-for-cycling-travel",
    "kids-beauty-magic-makeup-set-fashion-beauty-cosmetic-kit-for-girls-safe-fun-play-makeup",
    "portable-silicone-wax-warmer-wax-heater-machine-hot-pot-hot-hair-removal-machine"
];

async function getImages() {
    const results = {};
    for (const handle of handles) {
        try {
            const response = await fetch(`https://aibazar.pk/products/${handle}.js`);
            if (response.ok) {
                const data = await response.json();
                results[handle] = data.featured_image ? `https:${data.featured_image}` : "NOT_FOUND";
            } else {
                results[handle] = "NOT_FOUND";
            }
        } catch (e) {
            results[handle] = "ERROR";
        }
    }
    fs.writeFileSync('batch4a_images.json', JSON.stringify(results, null, 2));
    console.log('Images saved to batch4a_images.json');
}

getImages();
