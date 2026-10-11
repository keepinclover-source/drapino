import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  PanelRightClose, 
  PanelRightOpen, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeColor?: string;
  onClick?: () => void;
}

export interface SidebarMenuGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarMenuItem[];
  defaultOpen?: boolean;
}

interface PortalAccordionSidebarProps {
  title: string;
  subtitle?: string;
  roleBadge?: {
    text: string;
    color: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  groups: SidebarMenuGroup[];
  activeItemId: string;
  onSelectItemId: (id: string) => void;
  storageKey: string;
  extraHeader?: React.ReactNode;
  extraFooter?: React.ReactNode;
}

export const PortalAccordionSidebar: React.FC<PortalAccordionSidebarProps> = ({
  title,
  subtitle,
  roleBadge,
  groups,
  activeItemId,
  onSelectItemId,
  storageKey,
  extraHeader,
  extraFooter,
}) => {
  // Collapsed state (persisted)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`sidebar_collapsed_${storageKey}`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Accordion open groups state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((g) => {
      // By default open if defaultOpen is true or if it contains the active item
      const containsActive = g.items.some((i) => i.id === activeItemId);
      initial[g.id] = g.defaultOpen !== undefined ? g.defaultOpen : true;
      if (containsActive) initial[g.id] = true;
    });
    return initial;
  });

  // Keep accordion group open if activeItemId changes
  useEffect(() => {
    groups.forEach((g) => {
      if (g.items.some((i) => i.id === activeItemId)) {
        setOpenGroups((prev) => ({ ...prev, [g.id]: true }));
      }
    });
  }, [activeItemId, groups]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`sidebar_collapsed_${storageKey}`, String(next));
      } catch {}
      return next;
    });
  };

  const toggleGroup = (groupId: string) => {
    if (isCollapsed) {
      // If user clicks a group when collapsed, expand sidebar and open that group
      setIsCollapsed(false);
      try {
        localStorage.setItem(`sidebar_collapsed_${storageKey}`, 'false');
      } catch {}
      setOpenGroups((prev) => ({ ...prev, [groupId]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleItemClick = (item: SidebarMenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      onSelectItemId(item.id);
    }
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Floating Menu Button (visible on small screens) */}
      <div className="lg:hidden mb-4 flex items-center justify-between bg-white border border-stone-200 p-3 rounded-2xl shadow-xs">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>منوی آکاردئونی پنل</span>
        </button>
        {roleBadge && (
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${roleBadge.color}`}>
            {roleBadge.text}
          </span>
        )}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs lg:hidden flex justify-end"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="w-80 max-w-[85vw] h-full bg-white shadow-2xl overflow-y-auto p-4 flex flex-col text-right animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <div>
                <h3 className="font-black text-stone-900 text-sm">{title}</h3>
                {subtitle && <p className="text-[11px] text-stone-500">{subtitle}</p>}
              </div>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {groups.map((group) => {
                const GroupIcon = group.icon;
                const isOpen = openGroups[group.id] !== false;
                return (
                  <div key={group.id} className="border border-stone-200/80 rounded-2xl overflow-hidden bg-stone-50/50">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-stone-800 hover:bg-stone-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center">
                          <GroupIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>{group.title}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="p-1.5 space-y-1 bg-white border-t border-stone-100">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = activeItemId === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                                isActive
                                  ? 'bg-amber-700 text-white shadow-xs'
                                  : 'text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ItemIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                                <span>{item.label}</span>
                              </div>
                              {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                  isActive
                                    ? 'bg-white/25 text-white'
                                    : item.badgeColor || 'bg-amber-100 text-amber-900'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Accordion Sidebar (RTL: appears on the Right side) */}
      <aside 
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="sticky top-20 bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-6rem)]">
          
          {/* Sidebar Top Header & Collapse Toggle */}
          <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-b from-stone-50/70 to-white shrink-0">
            {!isCollapsed ? (
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-stone-900 text-sm truncate">{title}</h3>
                  {roleBadge && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${roleBadge.color}`}>
                      {roleBadge.text}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-[10px] text-stone-500 truncate mt-0.5">{subtitle}</p>
                )}
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <span className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-black text-xs shadow-2xs">
                  {title.slice(0, 1)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? 'باز کردن منو آکاردئونی' : 'جمع کردن منو به کنار'}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all cursor-pointer shrink-0"
            >
              {isCollapsed ? (
                <PanelRightOpen className="w-4 h-4 text-amber-700" />
              ) : (
                <PanelRightClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {extraHeader && !isCollapsed && (
            <div className="p-3 border-b border-stone-100 bg-amber-50/40 shrink-0">
              {extraHeader}
            </div>
          )}

          {/* Accordion Menu Body */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {groups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = openGroups[group.id] !== false;
              const hasActiveChild = group.items.some((i) => i.id === activeItemId);

              if (isCollapsed) {
                // Collapsed mode: icon buttons with hover popovers/quick triggers
                return (
                  <div key={group.id} className="space-y-1.5 py-1 border-b border-stone-100 last:border-0 flex flex-col items-center">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      title={group.title}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        hasActiveChild 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs' 
                          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <GroupIcon className="w-4 h-4" />
                    </button>
                    {/* Quick item icons */}
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = activeItemId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          title={item.label}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                            isActive
                              ? 'bg-amber-700 text-white shadow-xs scale-105'
                              : 'text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                          {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              }

              // Expanded mode: Accordion Group
              return (
                <div 
                  key={group.id} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                    hasActiveChild 
                      ? 'border-amber-200/90 bg-stone-50/70 shadow-2xs' 
                      : 'border-stone-200/70 bg-white'
                  }`}
                >
                  {/* Accordion Group Header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-stone-800 hover:bg-stone-100/60 transition-colors text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        hasActiveChild ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        <GroupIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate text-[11px] sm:text-xs font-extrabold">{group.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasActiveChild && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      )}
                      <ChevronDown 
                        className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-amber-700' : ''
                        }`} 
                      />
                    </div>
                  </button>

                  {/* Accordion Items List */}
                  {isOpen && (
                    <div className="p-1.5 space-y-1 bg-white border-t border-stone-100 animate-in fade-in duration-150">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = activeItemId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleItemClick(item)}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-right cursor-pointer group ${
                              isActive
                                ? 'bg-amber-700 text-white shadow-xs'
                                : 'text-stone-700 hover:bg-stone-100/80 hover:text-stone-950'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ItemIcon 
                                className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                                  isActive ? 'text-white' : 'text-stone-400 group-hover:text-amber-700'
                                }`} 
                              />
                              <span className="truncate text-[11px] leading-tight">{item.label}</span>
                            </div>

                            {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.badgeColor || 'bg-amber-100 text-amber-900 border border-amber-200/60'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          {extraFooter && !isCollapsed && (
            <div className="p-3 border-t border-stone-100 bg-stone-50/70 shrink-0 text-xs">
              {extraFooter}
            </div>
          )}

          {/* Quick Collapse Footer Toggle Button */}
          <div className="p-2 border-t border-stone-100 bg-stone-50/50 shrink-0 flex justify-center">
            <button
              onClick={toggleCollapse}
              className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isCollapsed ? (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span className="sr-only">باز کردن منو</span>
                </>
              ) : (
                <>
                  <PanelRightClose className="w-3.5 h-3.5" />
                  <span>جمع کردن منو به کنار</span>
                </>
              )}
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};
