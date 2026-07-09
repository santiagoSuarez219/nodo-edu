import Link from 'next/link';
import { FooterLink } from '@/lib/landing/types';

interface LandingFooterProps {
  links: FooterLink[];
}

export function LandingFooter({ links }: LandingFooterProps) {
  return (
    <footer
      className="border-t border-gray-200 dark:border-gray-700 mt-16 pt-12 pb-8"
      role="contentinfo"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            nodo © 2026
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Plataforma educativa para ingenieros
          </p>
        </div>

        <ul className="flex gap-6 sm:gap-8" role="list">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
