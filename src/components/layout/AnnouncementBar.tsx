import { BadgeCheck, PackageOpen, Truck, MessageCircle } from "lucide-react";

const items = [
  { icon: BadgeCheck, label: "Cash on Delivery" },
  { icon: PackageOpen, label: "Open Parcel Before Payment" },
  { icon: Truck, label: "1–3 Day Delivery" },
  { icon: MessageCircle, label: "WhatsApp Support" },
];

/** Slim trust strip pinned above the header. Dark, restrained, local-market first. */
export const AnnouncementBar = () => {
  return (
    <div className="bg-secondary border-b border-white/5 text-secondary-foreground">
      <div className="container-custom">
        <ul className="flex items-center justify-center gap-x-6 gap-y-1 py-2 flex-wrap">
          {items.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75 ${
                i > 1 ? "hidden sm:flex" : ""
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-trust shrink-0" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
