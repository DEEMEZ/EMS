'use client';
import { navigationConfig, NavItem } from '@/config/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

const NavbarComponent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { status } = useSession();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !dropdownRefs.current[openDropdown]?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Close dropdown when route changes
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const DesktopDropdown = ({ item }: { item: NavItem }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openDropdown === item.title;

    return (
      <div
        ref={(el) => {
          dropdownRefs.current[item.title] = el;
        }}
        className="relative"
      >
        <button
          onClick={() => setOpenDropdown(isOpen ? null : item.title)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all
            ${isOpen ? 'text-blue-600 bg-blue-50' : 'hover:bg-gray-50'}`}
        >
          {item.icon && React.createElement(item.icon as React.ComponentType<{ className: string }>, { className: "w-5 h-5" })}
          <span className="text-sm font-medium">{item.title}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && hasSubItems && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50"
            >
              {item.subItems?.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors
                    ${pathname === subItem.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {subItem.icon && React.createElement(subItem.icon as React.ComponentType<{ className: string }>, { className: "w-4 h-4" })}
                  {subItem.title}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const MobileDropdown = ({ item }: { item: NavItem }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div className="px-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-3 rounded-md transition-all
            ${isOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-2">
            {item.icon && React.createElement(item.icon as React.ComponentType<{ className: string }>, { className: "w-5 h-5" })}
            <span className="text-sm font-medium">{item.title}</span>
          </div>
          {hasSubItems && (
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        <AnimatePresence>
          {isOpen && hasSubItems && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-4 mt-1"
            >
              {item.subItems?.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`flex items-center gap-2 p-3 rounded-md text-sm transition-colors
                    ${pathname === subItem.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {subItem.icon && React.createElement(subItem.icon as React.ComponentType<{ className: string }>, { className: "w-4 h-4" })}
                  {subItem.title}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">EMS</span>
            <span className="text-gray-700">System</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Only show navigation items when logged in */}
            {status === "authenticated" && navigationConfig.map((item) => (
              item.subItems ? (
                <DesktopDropdown key={item.title} item={item} />
              ) : (
                <Link
                  key={item.title}
                  href={item.href || '#'}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all
                    ${pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'hover:bg-gray-50'
                    }`}
                >
                  {item.icon && React.createElement(item.icon as React.ComponentType<{ className: string }>, { className: "w-5 h-5" })}
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              )
            ))}

            {/* Auth Buttons */}
            <div className="ml-4 flex items-center gap-2">
              {status === "authenticated" ? (
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-50"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t"
          >
            <div className="space-y-1 py-3">
              {/* Only show navigation items when logged in */}
              {status === "authenticated" && navigationConfig.map((item) => (
                <MobileDropdown key={item.title} item={item} />
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="px-2 pt-4 pb-1 space-y-2">
                {status === "authenticated" ? (
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="block w-full px-3 py-2 text-sm font-medium text-center text-gray-700 hover:text-blue-600 rounded-md border hover:bg-gray-50"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block w-full px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavbarComponent;