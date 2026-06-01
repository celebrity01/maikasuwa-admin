/**
 * KASUWA Admin — Category & shared data
 */

export const CATEGORY_LABELS: Record<string, string> = {
  vehicles: "Vehicles",
  electronics: "Electronics",
  property: "Property",
  fashion: "Fashion",
  "home-garden": "Home & Garden",
  "health-beauty": "Health & Beauty",
  services: "Services",
  agriculture: "Agriculture",
  jobs: "Jobs",
  "food-drinks": "Food & Drinks",
  "kids-baby": "Kids & Baby",
  "sports-outdoors": "Sports & Outdoors",
};

export const CATEGORY_ICONS: Record<string, string> = {
  vehicles: "🚗",
  electronics: "📱",
  property: "🏠",
  fashion: "👗",
  "home-garden": "🛋️",
  "health-beauty": "💄",
  services: "🔧",
  agriculture: "🌾",
  jobs: "💼",
  "food-drinks": "🍕",
  "kids-baby": "👶",
  "sports-outdoors": "⚽",
};

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const PRODUCT_CONDITIONS = [
  "Brand New",
  "Tokunbo (Belgium)",
  "London Used",
  "Nigerian Used",
  "Refurbished",
  "Custom Made",
  "Handmade",
  "Fresh",
  "Live",
  "Available Now",
  "Full-Time",
  "Part-Time",
  "Remote",
  "Serviced",
  "New Build",
];

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString("en-NG")}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusColor(status: string, isDisabled?: boolean): string {
  if (isDisabled) return "bg-orange-500/15 text-orange-400 border-orange-500/20";
  switch (status) {
    case "approved": return "bg-green-500/15 text-green-400 border-green-500/20";
    case "pending": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "rejected": return "bg-red-500/15 text-red-400 border-red-500/20";
    default: return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
  }
}
