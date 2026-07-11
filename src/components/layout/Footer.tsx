import Link from "next/link";
import { Share2, Globe, Mail, Video } from "lucide-react";
import { BrandLogoFooter } from "@/components/brand/BrandLogo";

const footerLinks = {
  shop: [
    { label: "All Wigs", href: "/shop/wigs" },
    { label: "Bundles", href: "/shop/bundles" },
    { label: "Closures & Frontals", href: "/shop/closures-frontals" },
    { label: "Sale", href: "/shop/sale" },
    { label: "Gift Cards", href: "/gift-cards" },
  ],
  help: [
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "Care Instructions", href: "/care-instructions" },
    { label: "Track Order", href: "/account/orders" },
    { label: "Contact Us", href: "/contact" },
  ],
  company: [
    { label: "Our Story", href: "/our-story" },
    { label: "Blog", href: "/blog" },
    { label: "Affiliate Program", href: "/affiliate" },
    { label: "Wholesale", href: "/wholesale" },
  ],
};

const socialLinks = [
  { icon: Share2, href: "https://instagram.com", label: "Instagram" },
  { icon: Globe, href: "https://facebook.com", label: "Facebook" },
  { icon: Mail, href: "https://twitter.com", label: "Twitter" },
  { icon: Video, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-noir text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <BrandLogoFooter />
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              Luxury human hair wigs, bundles, and frontals crafted for the
              woman who demands nothing less than perfection.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-champagne hover:text-champagne transition-colors"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="text-xs tracking-[0.2em] uppercase text-champagne mb-4">
                {key}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-champagne transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 tracking-wide">
            © {new Date().getFullYear()} Tressé Hair. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-champagne transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-champagne transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="hover:text-champagne transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
