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
    {
      title: 'Expense Categories',
      icon: UserCircle,
      subItems: [
        {
          title: 'Expense Category List',
          href: '/expensecategories/list',
          icon: ListIcon,
        },
        {
          title: 'Add Expense Category',
          href: '/expensecategories/add',
          icon: PlusCircle,
        },
      ],
    },
    {
      title: 'Income Sources',
      icon: UserCircle,
      subItems: [
        {
          title: 'Income Sources List',
          href: '/incomesources/list',
          icon: ListIcon,
        },
        {
          title: 'Add Income Sources',
          href: '/incomesources/add',
          icon: PlusCircle,
        },
      ],
    },
    {
      title: 'Banks',
      icon: UserCircle,
      subItems: [
        {
          title: 'Banks List',
          href: '/banks/list',
          icon: ListIcon,
        },
        {
          title: 'Add Banks',
          href: '/banks/add',
          icon: PlusCircle,
        },
      ],
    },
    {
      title: 'Tags',
      icon: UserCircle,
      subItems: [
        {
          title: 'Tags List',
          href: '/tags/list',
          icon: ListIcon,
        },
        {
          title: 'Add Tags',
          href: '/tags/add',
          icon: PlusCircle,
        },
      ],
    },
    {
      title: 'Payment Methods',
      icon: UserCircle,
      subItems: [
        {
          title: 'Payment Methods List',
          href: '/paymentmethods/list',
          icon: ListIcon,
        },
        {
          title: 'Add Payment Methods',
          href: '/paymentmethods/add',
          icon: PlusCircle,
        },
      ],
    },
    
  ];