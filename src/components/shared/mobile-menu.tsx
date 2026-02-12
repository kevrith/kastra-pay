'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b shadow-lg p-4 space-y-3">
          <Link href="/about" onClick={() => setIsOpen(false)} className="block py-2 hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="block py-2 hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href="/faq" onClick={() => setIsOpen(false)} className="block py-2 hover:text-primary transition-colors">
            FAQ
          </Link>
          <div className="pt-3 border-t flex items-center justify-between">
            <ThemeToggle />
            <div className="flex gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
