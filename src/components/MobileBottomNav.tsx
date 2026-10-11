import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, UtensilsCrossed, Info, Phone, TrendingUp, ShoppingBag, Utensils, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useFood } from '../context/FoodContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { orders } = useOrders();
  const { foodItems } = useFood();

  // Admin Mobile Bottom Navigation
  if (isAdmin || location.pathname.startsWith('/admin')) {
    const currentTab = searchParams.get('tab') || 'overview';

    const adminNavItems = [
      {
        id: 'overview',
        name: 'Overview',
        icon: TrendingUp,
      },
      {
        id: 'orders',
        name: 'Orders',
        icon: ShoppingBag,
        badge: orders.length,
      },
      {
        id: 'menu',
        name: 'Menu',
        icon: Utensils,
        badge: foodItems.length,
      },
      {
        id: 'customers',
        name: 'Customers',
        icon: Users,
      },
    ];

    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl px-2 py-1.5"
        aria-label="Admin Mobile Navigation"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {adminNavItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (location.pathname === '/admin') {
                    setSearchParams({ tab: item.id });
                  } else {
                    navigate(`/admin?tab=${item.id}`);
                  }
                }}
                className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all group"
              >
                {/* Icon Container: Active items display in orange pill */}
                <div className="relative">
                  <div
                    className={`flex items-center justify-center transition-all ${
                      isActive
                        ? 'px-3.5 py-1 bg-orange-100 text-orange-800 rounded-full shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 p-1'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[9px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center ring-2 ring-white leading-none">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                    isActive ? 'font-bold text-gray-900' : 'font-medium text-gray-500'
                  }`}
                >
                  {item.name}
                </span>

                {/* Active Indicator Dot: Orange */}
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-0.5 transition-all" />
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
    },
    {
      name: 'Menu',
      path: '/menu',
      icon: UtensilsCrossed,
    },
    {
      name: 'About',
      path: '/about',
      icon: Info,
    },
    {
      name: 'Contact',
      path: '/contact',
      icon: Phone,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl px-2 py-1.5"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all group"
            >
              {/* Icon Container: Active items display in orange pill */}
              <div className="relative">
                <div
                  className={`flex items-center justify-center transition-all ${
                    isActive
                      ? 'px-3.5 py-1 bg-orange-100 text-orange-800 rounded-full shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 p-1'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'font-bold text-gray-900' : 'font-medium text-gray-500'
                }`}
              >
                {item.name}
              </span>

              {/* Active Indicator Dot: Orange */}
              {isActive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-0.5 transition-all" />
              ) : (
                <span className="w-1.5 h-1.5 opacity-0 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
