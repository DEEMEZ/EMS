import {
  LayoutDashboard,
  Settings,
  Building2,
  UserCircle,
  Tags,
  Wallet,
  BanknoteIcon,
  BookOpen,
  ArrowRightLeft,
  ListIcon,
  PlusCircle,
  PieChart,
  FileBarChart,
  DollarSign,
  Receipt,
  CircleDollarSign,
  CreditCard
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
      },
      {
        title: 'Users',
        href: '/user/list',
        icon: UserCircle,
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
        href: '/PaymentMethods/list',
        icon: CreditCard,
      },
      {
        title: 'Tags',
        href: '/tags/list',
        icon: Tags,
      }
    ],
  },
  {
    title: 'Transactions',
    icon: ArrowRightLeft,
    subItems: [
      {
        title: 'Income',
        href: '/transactions/income/list',
        icon: DollarSign,
      },
      {
        title: 'Expenses',
        href: '/transactions/expenses/list',
        icon: Receipt,
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
      }
    ],
  }
];