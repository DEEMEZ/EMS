import {
  ArrowRightLeft,
  BanknoteIcon,
  BookOpen,
  Building2,
  CircleDollarSign,
  CreditCard,
  DollarSign,
  FileBarChart,
  LayoutDashboard,
  PieChart,
  Receipt,
  Settings,
  Tags,
  UserCircle,
  Wallet
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
    title: 'Setup',
    icon: Settings,
    subItems: [
      {
        title: 'Organization',
        href: '/organization/list',
        icon: Building2,
      }
    ],
  },
  {
    title: 'Master Data',
    icon: BookOpen,
    subItems: [
      {
        title: 'Expense Categories',
        href: '/ExpCat/list',
        icon: Wallet,
      },
      {
        title: 'Income Sources',
        href: '/incomesources/list',
        icon: CircleDollarSign,
      },
      {
        title: 'Banks',
        href: '/banks/list',
        icon: BanknoteIcon,
      },
      {
        title: 'Payment Methods',
        href: '/paymentmethods/list',
        icon: CreditCard,
      },
      {
        title: 'Taggs',
        href: '/taggs/list',
        icon: Tags,
      }
    ],
  },
  {
    title: 'Transactions',
    icon: ArrowRightLeft,
    subItems: [
       {
        title: 'Transactions',
        href: '/transactions/transaction/list',
        icon: ArrowRightLeft,
      },
      {
        title: 'Income',
        href: '/transactions/incomes/list',
        icon: DollarSign,
      },
      {
        title: 'Expenses',
        href: '/transactions/expense/list',
        icon: Receipt,
      },
       {
        title: 'Budgets',
        href: '/transactions/budgets/list',
        icon: Wallet,
      },
    ],
  },
  {
    title: 'Reports',
    icon: FileBarChart,
    subItems: [
      {
        title: 'Expense Analysis',
        href: '/reports/expense-analysis',
        icon: PieChart,
      },
      {
        title: 'Income Analysis',
        href: '/reports/income-analysis',
        icon: FileBarChart,
      },
      {
        title: 'Budget Reports',
        href: '/reports/budget',
        icon: DollarSign,
      },
      {
        title: 'Transaction Reports',
        href: '/reports/transaction',
        icon: ArrowRightLeft,
      }
      ,{
        title: 'Organization Report',
        href: '/reports/organization',
        icon: Building2,  
      }      
    ],
  }
];