// src/config/navigation.ts
import {
    Building2,
    LayoutDashboard,
    BoxIcon,
    UserCircle,
    Hotel,
    PlusCircle,
    ListIcon
  } from 'lucide-react';
  
  export interface SubNavItem {
    title: string;
    href: string;
    icon?: React.ComponentType;
  }
  
  export interface NavItem {
    title: string;
    href?: string;
    icon?: React.ComponentType;
    subItems?: SubNavItem[];
  }
  
  export const navigationConfig: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Organization',
      icon: Building2,
      subItems: [
        {
          title: 'Organizations List',
          href: '/organization/list',
          icon: ListIcon,
        },
        {
          title: 'Add Organization',
          href: '/organization/add',
          icon: PlusCircle,
        },
        {
          title: 'Locations List',
          href: '/organization/locations',
          icon: ListIcon,
        },
        {
          title: 'Add Location',
          href: '/organization/locations/add',
          icon: PlusCircle,
        },
      ],
    },
    {
      title: 'Inventory',
      icon: BoxIcon,
      subItems: [
        {
          title: 'Items List',
          href: '/inventory/items',
          icon: ListIcon,
        },
        {
          title: 'Add Item',
          href: '/inventory/items/add',
          icon: PlusCircle,
        },
        {
          title: 'Categories List',
          href: '/inventory/categories',
          icon: ListIcon,
        },
        {
          title: 'Add Category',
          href: '/inventory/categories/add',
          icon: PlusCircle,
        },
        {
          title: 'Subcategories List',
          href: '/inventory/subcategories',
          icon: ListIcon,
        },
        {
          title: 'Add Subcategory',
          href: '/inventory/subcategories/add',
          icon: PlusCircle,
        },
      ],
    },
    {
      title: 'Rooms',
      icon: Hotel,
      subItems: [
        {
          title: 'Rooms List',
          href: '/rooms/list',
          icon: ListIcon,
        },
        {
          title: 'Add Room',
          href: '/rooms/add',
          icon: PlusCircle,
        },
        {
          title: 'Bookings List',
          href: '/rooms/bookings',
          icon: ListIcon,
        },
        {
          title: 'Add Booking',
          href: '/rooms/bookings/add',
          icon: PlusCircle,
        },
        {
          title: 'Categories List',
          href: '/rooms/categories',
          icon: ListIcon,
        },
        {
          title: 'Add Category',
          href: '/rooms/categories/add',
          icon: PlusCircle,
        },
      ],
    },
    {
      title: 'Users',
      icon: UserCircle,
      subItems: [
        {
          title: 'Users List',
          href: '/users/list',
          icon: ListIcon,
        },
        {
          title: 'Add User',
          href: '/users/add',
          icon: PlusCircle,
        },
      ],
    },
  ];