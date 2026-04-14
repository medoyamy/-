import React, { useState, useEffect } from 'react';
import { safeStringify } from '../lib/mapUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit2, 
  Check, 
  X,
  LayoutGrid,
  Map,
  Tag,
  Users,
  Star,
  Trophy,
  Smartphone,
  ShoppingBag,
  Briefcase,
  Utensils,
  Store,
  Ticket,
  Handshake,
  Car,
  Shield,
  Grid,
  Percent,
  Clock,
  Layers,
  Package,
  Settings as SettingsIcon,
  ClipboardList,
  BarChart3,
  Eye,
  EyeOff,
  ChevronLeft,
  Circle,
  Home, Shirt, Laptop, Flower2, BookOpen, Armchair, Sparkles, Gamepad2, Palette, Zap,
  Truck, Plane, Wrench, Bike, Navigation, Search, Rocket, Info, MessageSquare,
  UserPlus, Video,
  CheckCircle2, MapPin,
  SquarePen, BadgePercent, Filter, Gift,
  Beef, Waves, Croissant, Cookie, Leaf, Pill, Cake, Hammer, Wind,
  Ban
} from 'lucide-react';
import { useSettings, ServiceTab, AppSection, Category, SubCategory, iconLabels } from '../context/SettingsContext';

export const iconMap: Record<string, any> = {
  LayoutGrid, Map, Tag, Users, Star, Trophy, Smartphone, ShoppingBag, 
  Briefcase, Utensils, Store, Ticket, Handshake, Car, Shield, Grid, 
  Percent, Clock, Layers, Package, SettingsIcon, ClipboardList, BarChart3, Circle,
  Home, Shirt, Laptop, Flower2, BookOpen, Armchair, Sparkles, Gamepad2, Palette, Zap,
  Truck, Plane, Wrench, Bike, Navigation, Search, ArrowRight, Rocket, Info, MessageSquare,
  UserPlus, Trash2, Plus, CheckCircle2, MapPin, ChevronLeft, Video,
  SquarePen, BadgePercent, Filter, Gift,
  Beef, Waves, Croissant, Cookie, Leaf, Pill, Cake, Hammer, Wind,
  None: Ban
};

interface AppStructurePageProps {
  onClose?: () => void;
  isOverlay?: boolean;
  userMode?: 'user' | 'merchant' | 'provider' | 'driver' | 'deal_manager' | 'deal_provider' | 'admin' | 'restaurant';
  title?: string;
  onManagePages?: (serviceId: string, sectionId: string) => void;
}

type DrillDownLevel = 'tabs' | 'sections' | 'categories' | 'subcategories' | 'delivery_categories' | 'delivery_vehicles';

interface PathItem {
  level: DrillDownLevel;
  id: string;
  label: string;
}

export default function AppStructurePage({ onClose, isOverlay = true, userMode, title, onManagePages }: AppStructurePageProps) {
  const { 
    services,
    serviceTabs, 
    appStructure, 
    categories,
    addService,
    updateService,
    deleteService,
    reorderServices,
    addServiceTab, 
    updateServiceTab, 
    deleteServiceTab, 
    reorderServiceTabs,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    reorderSubCategories,
    deliveryCategories,
    deliveryVehicles,
    addDeliveryCategory,
    updateDeliveryCategory,
    deleteDeliveryCategory,
    reorderDeliveryCategories,
    addDeliveryVehicle,
    updateDeliveryVehicle,
    deleteDeliveryVehicle,
    reorderDeliveryVehicles,
    resetToDefaults,
    resetServiceToDefaults
  } = useSettings();

  const filteredServices = React.useMemo(() => {
    if (!userMode) return services;
    return services.filter(service => {
      // Show if the service itself matches the mode
      if (service.userMode === userMode) return true;
      // OR if it has any tabs matching the mode
      const tabs = serviceTabs[service.id] || [];
      return tabs.some(tab => tab.userMode === userMode);
    });
  }, [services, serviceTabs, userMode]);

  const [activeService, setActiveService] = useState(filteredServices[0]?.id || 'mercato');
  useEffect(() => {
    // Admin should see all services to manage them
    if (filteredServices.length > 0 && !filteredServices.some(s => s.id === activeService)) {
      setActiveService(filteredServices[0].id);
    }
  }, [filteredServices, activeService]);

  const [path, setPath] = useState<PathItem[]>([]);
  const [isManagingServices, setIsManagingServices] = useState(false);
  
  // Modals state
  const [showModal, setShowModal] = useState<'tab' | 'section' | 'category' | 'subcategory' | 'service' | 'delivery_category' | 'delivery_vehicle' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const currentTab = path.find(p => p.level === 'tabs');
  const currentSection = path.find(p => p.level === 'sections');
  const currentCategory = path.find(p => p.level === 'categories' || p.level === 'delivery_categories');

  const currentSectionObj = (appStructure[activeService] || []).find(s => s.id === currentSection?.id);
  const currentLevel: DrillDownLevel = path.length === 0 ? 'tabs' : 
                                      path.length === 1 ? 'sections' :
                                      path.length === 2 ? (
                                        activeService === 'delivery' && (
                                          currentSectionObj?.type === 'delivery_categories' || 
                                          currentSectionObj?.type === 'vehicle_selector' ||
                                          currentSectionObj?.type === 'delivery_locations' ||
                                          currentSectionObj?.type === 'map_view'
                                        )
                                          ? (currentSectionObj?.type === 'delivery_categories' ? 'delivery_categories' : 'delivery_vehicles')
                                          : 'categories'
                                      ) :
                                      path.length === 3 ? (
                                        activeService === 'delivery' && (
                                          currentSectionObj?.type === 'delivery_categories' || 
                                          path[2].level === 'delivery_categories' ||
                                          currentSectionObj?.type === 'vehicle_selector' ||
                                          currentSectionObj?.type === 'delivery_locations' ||
                                          currentSectionObj?.type === 'map_view'
                                        ) ? 'delivery_vehicles' : 'subcategories'
                                      ) : 'subcategories';

  // Sync path with history
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.type === 'app_structure_path') {
        setPath(event.state.path || []);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updatePath = (newPath: PathItem[]) => {
    window.history.pushState({ type: 'app_structure_path', path: newPath }, '');
    setPath(newPath);
  };

  const handleDrillDown = (level: DrillDownLevel, id: string, label: string) => {
    console.log('Drilling down to:', safeStringify({ level, id, label }));
    updatePath([...path, { level, id, label }]);
  };

  const handleGoBack = () => {
    if (path.length > 0) {
      window.history.back();
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setActiveService(serviceId);
    updatePath([]); // Reset path when switching services
  };

  const renderIcon = (iconName: string, size = 20) => {
    if (iconName === 'None') return <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-white/20">X</div>;
    const Icon = iconMap[iconName] || Grid;
    return <Icon size={size} />;
  };

  const openModal = (type: 'tab' | 'section' | 'category' | 'subcategory' | 'service' | 'delivery_category' | 'delivery_vehicle', item?: any) => {
    setEditingItem(item || null);
    if (item) {
      setFormData({ ...item });
    } else {
      if (type === 'tab') setFormData({ label: '', icon: 'LayoutGrid', userMode: userMode || 'user', isActive: true });
      if (type === 'section') setFormData({ name: '', icon: 'Grid', description: '', type: 'categories', layout: 'grid', isActive: true });
      if (type === 'category') setFormData({ name: '', icon: 'Grid', color: 'bg-blue-500', isActive: true });
      if (type === 'subcategory') setFormData({ name: '', icon: 'Circle', isActive: true });
      if (type === 'service') setFormData({ name: '', icon: 'Grid', isActive: true });
      if (type === 'delivery_category') setFormData({ name: '', icon: 'Grid', isActive: true });
      if (type === 'delivery_vehicle') setFormData({ name: '', icon: 'Car', baseFare: 20, perKmRate: 5, isActive: true });
    }
    setShowModal(type);
  };

  const handleSave = async () => {
    const dataWithParent = { ...formData };
    
    if (showModal === 'service') {
      if (editingItem) await updateService(editingItem.id, dataWithParent);
      else await addService(dataWithParent);
    } else if (showModal === 'tab') {
      if (editingItem) await updateServiceTab(activeService, editingItem.id, dataWithParent);
      else await addServiceTab(activeService, dataWithParent);
    } else if (showModal === 'section') {
      if (currentTab) dataWithParent.tabId = currentTab.id;
      if (currentCategory && currentLevel === 'subcategories') dataWithParent.subTabId = currentCategory.id;
      if (editingItem) await updateSection(activeService, editingItem.id, dataWithParent);
      else await addSection(activeService, dataWithParent);
    } else if (showModal === 'category') {
      if (currentSection) dataWithParent.sectionId = currentSection.id;
      if (editingItem) await updateCategory(activeService, editingItem.id, dataWithParent);
      else await addCategory(activeService, dataWithParent);
    } else if (showModal === 'subcategory') {
      if (editingItem) await updateSubCategory(activeService, currentCategory!.id, editingItem.id, dataWithParent);
      else await addSubCategory(activeService, currentCategory!.id, dataWithParent);
    } else if (showModal === 'delivery_category') {
      if (editingItem) await updateDeliveryCategory(editingItem.id, dataWithParent);
      else await addDeliveryCategory(dataWithParent);
    } else if (showModal === 'delivery_vehicle') {
      if (currentCategory) dataWithParent.categoryId = currentCategory.id;
      if (editingItem) await updateDeliveryVehicle(editingItem.id, dataWithParent);
      else await addDeliveryVehicle(dataWithParent);
    }
    setShowModal(null);
    setEditingItem(null);
    setFormData({});
  };

  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 px-2">
      <button 
        onClick={() => updatePath([])}
        className={`text-[10px] font-black whitespace-nowrap px-2 py-1 rounded-lg transition-all ${path.length === 0 ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:bg-gray-50'}`}
      >
        {services.find(s => s.id === activeService)?.name}
      </button>
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronLeft size={10} className="text-gray-300 shrink-0" />
          <button 
            onClick={() => updatePath(path.slice(0, index + 1))}
            className={`text-[10px] font-black whitespace-nowrap px-2 py-1 rounded-lg transition-all ${index === path.length - 1 ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  const renderManagementCard = (title: string, item: any, type: 'tab' | 'section' | 'category' | 'subcategory' | 'delivery_category') => (
    <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            {renderIcon(item?.icon || 'Grid', 20)}
          </div>
          <div>
            <h3 className="text-sm font-black">{title}</h3>
            <p className="text-[10px] font-bold text-white/50">إدارة الإعدادات والخصائص</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => openModal(type, item)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => {
              if (type === 'tab') updateServiceTab(activeService, item.id, { isActive: !item.isActive });
              if (type === 'section') updateSection(activeService, item.id, { isActive: !item.isActive });
              if (type === 'category') updateCategory(activeService, item.id, { isActive: !item.isActive });
              if (type === 'subcategory') updateSubCategory(activeService, currentCategory!.id, item.id, { isActive: !item.isActive });
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            {item?.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button 
            onClick={() => {
              if (confirm('هل أنت متأكد من الحذف؟')) {
                if (type === 'tab') deleteServiceTab(activeService, item.id);
                if (type === 'section') deleteSection(activeService, item.id);
                if (type === 'category') deleteCategory(activeService, item.id);
                if (type === 'subcategory') deleteSubCategory(activeService, currentCategory!.id, item.id);
                handleGoBack();
              }
            }}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderList = () => {
    let items: any[] = [];
    let title = "";
    let addType: any = null;
    let onReorder: any = null;
    let onDrillDown: any = null;

    if (currentLevel === 'tabs') {
      let allTabs = (serviceTabs[activeService] || []);
      if (userMode) {
        allTabs = allTabs.filter(t => t.userMode === userMode);
      }
      items = allTabs.sort((a, b) => a.order - b.order);
      title = "التبويبات العليا";
      addType = 'tab';
      onReorder = (id: string, dir: 'up' | 'down') => reorderServiceTabs(activeService, id, dir);
      onDrillDown = (item: any) => handleDrillDown('tabs', item.id, item.label);
    } else if (currentLevel === 'sections') {
      items = (appStructure[activeService] || [])
        .filter(s => !currentTab || s.tabId === currentTab?.id || s.tabId === 'all')
        .sort((a, b) => a.order - b.order);
      title = currentTab ? `أقسام ${currentTab.label}` : "جميع أقسام المحتوى";
      addType = 'section';
      onReorder = (id: string, dir: 'up' | 'down') => reorderSections(activeService, id, dir);
      onDrillDown = (item: any) => {
        const drillableTypes = [
          'categories', 'banners', 'featured_stores', 'tabs', 
          'top_tabs', 'main_tabs', 'sub_tabs', 'publishing_box', 
          'custom_content', 'delivery_categories', 'vehicle_selector',
          'delivery_locations', 'map_view', 'kilometers_display',
          'fare_meter', 'suggested_fare', 'budget_selector',
          'shipment_description', 'notes_input', 'driver_selector',
          'shipment_details', 'submit_button', 'add_request_button',
          'general_feed', 'nearby_feed', 'special_feed', 'friends_feed', 'group_feed', 'reels'
        ];
        // console.log('Section click:', safeStringify({ type: item.type, isDrillable: drillableTypes.includes(item.type) }));
        if (drillableTypes.includes(item.type)) {
          handleDrillDown('sections', item.id, item.name);
        }
      };
    } else if (currentLevel === 'categories') {
      items = (categories[activeService] || [])
        .filter(c => c.sectionId === currentSection?.id)
        .sort((a, b) => a.order - b.order);
      title = "إدارة التصنيفات";
      addType = 'category';
      onReorder = (id: string, dir: 'up' | 'down') => reorderCategories(activeService, id, dir);
      onDrillDown = (item: any) => handleDrillDown('categories', item.id, item.name);
    } else if (currentLevel === 'subcategories') {
      const cat = (categories[activeService] || []).find(c => c.id === currentCategory?.id);
      
      // Check if the parent section is a tabbed one
      const parentSection = (appStructure[activeService] || []).find(s => s.id === currentSection?.id);
      const isTabbed = parentSection?.type === 'main_tabs' || parentSection?.type === 'top_tabs' || parentSection?.type === 'sub_tabs';

      if (isTabbed) {
        items = (appStructure[activeService] || [])
          .filter(s => s.subTabId === currentCategory?.id)
          .sort((a, b) => a.order - b.order);
        title = `أقسام مرتبطة بـ ${currentCategory?.label}`;
        addType = 'section';
        onReorder = (id: string, dir: 'up' | 'down') => reorderSections(activeService, id, dir);
        onDrillDown = (item: any) => {
          const drillableTypes = [
            'categories', 'banners', 'featured_stores', 'tabs', 
            'top_tabs', 'main_tabs', 'sub_tabs', 'publishing_box', 
            'custom_content', 'delivery_categories', 'vehicle_selector',
            'delivery_locations', 'map_view', 'kilometers_display',
            'fare_meter', 'suggested_fare', 'budget_selector',
            'shipment_description', 'notes_input', 'driver_selector',
            'shipment_details', 'submit_button', 'add_request_button'
          ];
          if (drillableTypes.includes(item.type)) {
            handleDrillDown('sections', item.id, item.name);
          }
        };
      } else {
        items = cat?.subCategories || [];
        title = "الأقسام الفرعية";
        addType = 'subcategory';
        onReorder = (id: string, dir: 'up' | 'down') => reorderSubCategories(activeService, currentCategory!.id, id, dir);
        onDrillDown = null;
      }
    } else if (currentLevel === 'delivery_categories') {
      items = deliveryCategories.sort((a, b) => a.order - b.order);
      title = "تصنيفات التوصيل";
      addType = 'delivery_category';
      onReorder = (id: string, dir: 'up' | 'down') => reorderDeliveryCategories(id, dir);
      onDrillDown = (item: any) => handleDrillDown('delivery_categories', item.id, item.name);
    } else if (currentLevel === 'delivery_vehicles') {
      items = deliveryVehicles
        .filter(v => !currentCategory || v.categoryId === currentCategory?.id || !v.categoryId)
        .sort((a, b) => a.order - b.order);
      title = currentCategory ? `مركبات ${currentCategory.label}` : "إدارة جميع المركبات";
      addType = 'delivery_vehicle';
      onReorder = (id: string, dir: 'up' | 'down') => reorderDeliveryVehicles(id, dir);
      onDrillDown = null;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider">{title}</h2>
        <div className="flex items-center gap-2">
          {currentLevel === 'tabs' && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  if (confirm('هل أنت متأكد من إعادة ضبط هذه الخدمة فقط للمصنع؟')) {
                    resetServiceToDefaults(activeService);
                  }
                }}
                className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors"
                title="إعادة ضبط هذه الخدمة"
              >
                <Rocket size={18} />
              </button>
              <button 
                onClick={() => {
                  if (confirm('هل أنت متأكد من إعادة ضبط جميع الإعدادات للمصنع؟ سيتم مسح كل التعديلات الحالية.')) {
                    resetToDefaults();
                  }
                }}
                className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                title="إعادة ضبط المصنع"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
          <button 
            onClick={() => openModal(addType)}
            className="p-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        </div>

        <div className="grid gap-3">
          {items.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400">لا توجد عناصر حالياً</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group transition-all ${!item.isActive ? 'opacity-50 grayscale' : ''}`}
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => onDrillDown?.(item)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color || 'bg-gray-50'} ${item.color ? 'text-white' : 'text-gray-500'}`}>
                    {renderIcon(item.icon || 'Grid', 20)}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{item.label || item.name}</p>
                    <p className="text-[9px] font-bold text-gray-400">
                      {item.type ? `${item.type} • ` : ''}
                      {item.subTabId ? `تبويب فرعي: ${item.subTabId} • ` : ''}
                      {item.userMode ? `${item.userMode} • ` : ''}
                      {item.subCategories ? `${item.subCategories.length} أقسام فرعية` : 'إدارة التفاصيل'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {onManagePages && addType === 'section' && (
                    <button 
                      onClick={() => onManagePages(activeService, item.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="إدارة الصفحات في هذا القسم"
                    >
                      <Users size={14} />
                    </button>
                  )}
                  <button onClick={() => onReorder(item.id, 'up')} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"><ChevronUp size={14} /></button>
                  <button onClick={() => onReorder(item.id, 'down')} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"><ChevronDown size={14} /></button>
                  <button onClick={() => openModal(addType, item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                  <button 
                    onClick={() => {
                      if (addType === 'tab') updateServiceTab(activeService, item.id, { isActive: !item.isActive });
                      if (addType === 'section') updateSection(activeService, item.id, { isActive: !item.isActive });
                      if (addType === 'category') updateCategory(activeService, item.id, { isActive: !item.isActive });
                      if (addType === 'subcategory') updateSubCategory(activeService, currentCategory!.id, item.id, { isActive: !item.isActive });
                      if (addType === 'delivery_category') updateDeliveryCategory(item.id, { isActive: !item.isActive });
                      if (addType === 'delivery_vehicle') updateDeliveryVehicle(item.id, { isActive: !item.isActive });
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const content = (
    <div className={`${isOverlay ? 'max-w-4xl mx-auto p-4' : 'p-2'} space-y-6 pb-24`}>
      {/* Service Selector (Persistent at top) */}
      <div className={`sticky ${isOverlay ? 'top-[56px]' : 'top-[112px]'} z-20 bg-gray-50/95 backdrop-blur-md py-4 border-b border-gray-200 -mx-4 px-4 mb-4 shadow-sm`}>
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">الخدمات الرئيسية</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsManagingServices(!isManagingServices)}
              className={`p-1.5 rounded-lg transition-all ${isManagingServices ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}
            >
              <SettingsIcon size={14} />
            </button>
            {isManagingServices && (
              <button 
                onClick={() => openModal('service')}
                className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
          {filteredServices
            .sort((a, b) => a.order - b.order)
            .map(service => (
            <div key={service.id} className="relative group shrink-0">
              <button
                onClick={() => !isManagingServices && handleServiceChange(service.id)}
                className={`px-6 py-3 rounded-2xl font-black text-xs whitespace-nowrap transition-all border-2 flex items-center gap-2 ${
                  activeService === service.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-red-200 shadow-sm'
                } ${!service.isActive ? 'opacity-50 grayscale' : ''}`}
              >
                {renderIcon(service.icon || 'Grid', 14)}
                {service.name}
              </button>
              
              {isManagingServices && (
                <div className="absolute -top-2 -right-2 flex flex-col gap-1 z-30">
                  <div className="flex gap-1 bg-white p-1 rounded-lg shadow-lg border border-gray-100">
                    <button onClick={() => reorderServices(service.id, 'up')} className="p-1 text-gray-400 hover:text-gray-600"><ChevronUp size={12} /></button>
                    <button onClick={() => reorderServices(service.id, 'down')} className="p-1 text-gray-400 hover:text-gray-600"><ChevronDown size={12} /></button>
                    <button onClick={() => openModal('service', service)} className="p-1 text-blue-600 hover:text-blue-800"><Edit2 size={12} /></button>
                    <button onClick={() => updateService(service.id, { isActive: !service.isActive })} className="p-1 text-gray-400 hover:text-gray-600">
                      {service.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذه الخدمة؟ سيتم حذف جميع بياناتها.')) {
                          deleteService(service.id);
                          if (activeService === service.id) setActiveService(services[0]?.id || '');
                        }
                      }} 
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Breadcrumbs & Back Button */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        {path.length > 0 && (
          <button 
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowRight size={20} />
          </button>
        )}
        {renderBreadcrumbs()}
      </div>

      {/* Current Level Management */}
      {currentLevel === 'sections' && currentTab && renderManagementCard(`تبويب: ${currentTab.label}`, serviceTabs[activeService]?.find(t => t.id === currentTab.id), 'tab')}
      {currentLevel === 'categories' && currentSection && renderManagementCard(`قسم: ${currentSection.label}`, appStructure[activeService]?.find(s => s.id === currentSection.id), 'section')}
      {currentLevel === 'subcategories' && currentCategory && renderManagementCard(`تصنيف: ${currentCategory.label}`, categories[activeService]?.find(c => c.id === currentCategory.id), 'category')}
      {currentLevel === 'delivery_categories' && currentSection && renderManagementCard(`قسم: ${currentSection.label}`, appStructure[activeService]?.find(s => s.id === currentSection.id), 'section')}
      {currentLevel === 'delivery_vehicles' && currentCategory && renderManagementCard(`تصنيف: ${currentCategory.label}`, deliveryCategories.find(c => c.id === currentCategory.id), 'delivery_category')}

      {/* Children List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLevel + activeService + (path[path.length-1]?.id || 'root')}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          {renderList()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const modals = (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900">
                {editingItem ? 'تعديل' : 'إضافة'} {
                  showModal === 'service' ? 'خدمة' :
                  showModal === 'tab' ? 'تبويب' : 
                  showModal === 'section' ? 'قسم' : 
                  showModal === 'category' ? 'تصنيف' : 
                  showModal === 'delivery_category' ? 'تصنيف توصيل' :
                  showModal === 'delivery_vehicle' ? 'مركبة توصيل' : 'قسم فرعي'
                }
              </h3>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Common Name/Label Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 mr-1">الاسم</label>
                <input
                  type="text"
                  value={formData.label || formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, [showModal === 'tab' ? 'label' : 'name']: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all text-right"
                  placeholder="أدخل الاسم هنا..."
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 mr-1">الأيقونة</label>
                <select
                  value={formData.icon || 'Grid'}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                >
                  {Object.keys(iconMap).map(icon => (
                    <option key={icon} value={icon}>{iconLabels[icon] || icon}</option>
                  ))}
                </select>
              </div>

              {/* Tab Specific */}
              {showModal === 'tab' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 mr-1">وضع المستخدم</label>
                  <select
                    value={formData.userMode || 'user'}
                    onChange={(e) => setFormData({ ...formData, userMode: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                  >
                    <option value="user">مستخدم عادي</option>
                    <option value="merchant">تاجر ميركاتو</option>
                    <option value="restaurant">وكيل فريش مارت</option>
                    <option value="provider">مقدم خدمة أسيستو</option>
                    <option value="driver">سائق وصلني</option>
                    <option value="deal_manager">مدير صفقات ديلز</option>
                    <option value="admin">مسؤول</option>
                  </select>
                </div>
              )}

              {/* Section Specific */}
              {showModal === 'section' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">النوع</label>
                    <select
                      value={formData.type || 'categories'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                    >
                      <option value="categories">تصنيفات</option>
                      <option value="banners">بنرات</option>
                      <option value="featured_stores">متاجر</option>
                      <option value="tabs">تبويبات داخلية</option>
                      <option value="top_tabs">مربع تبويبات عليا</option>
                      <option value="main_tabs">مربع تبويبات رئيسية</option>
                      <option value="sub_tabs">مربع تبويبات فرعية</option>
                      <optgroup label="مربعات الأفالون">
                        <option value="my_posts">منشوراتي</option>
                        <option value="general_feed">المنشورات العامة</option>
                        <option value="nearby_feed">المنشورات القريبة</option>
                        <option value="special_feed">المنشورات الخاصة</option>
                        <option value="friends_feed">منشورات الأصدقاء</option>
                        <option value="group_feed">الطلبات الجماعية</option>
                        <option value="publishing_box">مربع النشر</option>
                      </optgroup>
                      <optgroup label="مربعات التوصيل">
                        <option value="delivery_categories">مربع تصنيفات التوصيل</option>
                        <option value="vehicle_selector">مربع اختيار نوع المركبة</option>
                        <option value="delivery_locations">مربع مواقع التوصيل</option>
                        <option value="map_view">مربع الخريطة</option>
                        <option value="kilometers_display">مربع الكيلومترات</option>
                        <option value="fare_meter">مربع البنديرة</option>
                        <option value="suggested_fare">مربع الأجرة المقترحة</option>
                        <option value="budget_selector">مربع تحديد الميزانية</option>
                        <option value="shipment_description">مربع وصف الشحنة</option>
                        <option value="notes_input">مربع ملاحظات</option>
                        <option value="driver_selector">مربع اختيار سائق</option>
                        <option value="shipment_details">مربع تفاصيل الشحنة</option>
                        <option value="submit_button">مربع إرسال الطلب</option>
                        <option value="add_request_button">زر إضافة طلب</option>
                        <option value="publishing_box">مربع نشر (مثل الأفالون)</option>
                      </optgroup>
                      <optgroup label="مربعات البروفايل">
                        <option value="profile_header">رأس الصفحة (الغلاف والصورة)</option>
                        <option value="profile_intro">المقدمة (البيانات الشخصية)</option>
                        <option value="provider_settings">إعدادات المزود (التخصص)</option>
                        <option value="stats_bar">شريط الإحصائيات</option>
                        <option value="top_tabs">تبويبات البروفايل</option>
                        <option value="tab_content">محتوى التبويب النشط</option>
                        <option value="reels">الريلز</option>
                        <option value="my_posts">منشوراتي</option>
                        <option value="points_balance">رصيد النقاط</option>
                        <option value="points_history">سجل النقاط</option>
                        <option value="points_offers">عروض النقاط</option>
                        <option value="orders_active">الطلبات النشطة</option>
                        <option value="orders_history">سجل الطلبات</option>
                        <option value="friends_requests">طلبات الصداقة</option>
                        <option value="friends_list">قائمة الأصدقاء</option>
                        <option value="subscription_system">نظام الاشتراكات المتكامل</option>
                        <option value="subs_active">اشتراكاتي النشطة</option>
                        <option value="subs_plans">خطط الاشتراك</option>
                        <option value="coupons_redeem">استبدال كوبون</option>
                        <option value="coupons_list">كوبوناتي</option>
                        <option value="my_ratings">تقييماتي</option>
                        <option value="my_settings">الإعدادات</option>
                        <option value="my_wallet">المحفظة</option>
                        <option value="my_pages">صفحاتي</option>
                      </optgroup>
                      <option value="custom_content">مخصص</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">التنسيق</label>
                    <select
                      value={formData.layout || 'grid'}
                      onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                    >
                      <option value="grid">شبكة</option>
                      <option value="list">قائمة</option>
                      <option value="scroll">تمرير</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">معرف التبويب الفرعي (اختياري)</label>
                    <input
                      type="text"
                      value={formData.subTabId || ''}
                      onChange={(e) => setFormData({ ...formData, subTabId: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all text-right"
                      placeholder="مثال: my-posts, general, nearby..."
                    />
                    <p className="text-[9px] text-gray-400 font-bold mr-1">يستخدم لربط القسم بتبويب معين داخل شريط التبويبات الرئيسي</p>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">معرف التبويب الرئيسي (tabId)</label>
                    <select
                      value={formData.tabId || 'all'}
                      onChange={(e) => setFormData({ ...formData, tabId: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                    >
                      <option value="all">الكل (يظهر دائماً)</option>
                      {(serviceTabs[activeService] || []).map(tab => (
                        <option key={tab.id} value={tab.id}>{tab.label}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-gray-400 font-bold mr-1">حدد التبويب الذي يجب أن يظهر فيه هذا القسم (مثلاً: my-profile, my-points...)</p>
                  </div>
                </div>
              )}

              {/* Section Specific Config */}
              {showModal === 'section' && formData.type === 'publishing_box' && (
                <div className="bg-gray-100/50 p-4 rounded-3xl space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">إعدادات مربع النشر</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">نص التلميح (Placeholder)</label>
                    <input
                      type="text"
                      value={formData.config?.placeholder || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        config: { ...(formData.config || {}), placeholder: e.target.value } 
                      })}
                      className="w-full bg-white border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all text-right"
                      placeholder="بماذا تفكر؟"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-2xl">
                    <span className="text-xs font-bold text-gray-600">إظهار أيقونات الوسائط (كاميرا/فيديو)</span>
                    <button
                      onClick={() => setFormData({ 
                        ...formData, 
                        config: { ...(formData.config || {}), showMediaIcons: !formData.config?.showMediaIcons } 
                      })}
                      className={`w-10 h-6 rounded-full transition-all relative ${formData.config?.showMediaIcons ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.config?.showMediaIcons ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Category Specific */}
              {showModal === 'category' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">اللون</label>
                    <select
                      value={formData.color || 'bg-blue-500'}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                    >
                      <option value="bg-blue-500">أزرق</option>
                      <option value="bg-red-500">أحمر</option>
                      <option value="bg-green-500">أخضر</option>
                      <option value="bg-purple-500">بنفسجي</option>
                      <option value="bg-pink-500">وردي</option>
                      <option value="bg-amber-500">برتقالي</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">اختر أيقونة التصنيف</label>
                    <div className="grid grid-cols-6 gap-2 bg-gray-50 p-3 rounded-3xl max-h-48 overflow-y-auto custom-scrollbar">
                      {Object.keys(iconMap).map(iconName => {
                        const Icon = iconMap[iconName];
                        const isSelected = formData.icon === iconName;
                        return (
                          <button
                            key={iconName}
                            onClick={() => setFormData({ ...formData, icon: iconName })}
                            className={`p-2 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100'}`}
                            title={iconLabels[iconName] || iconName}
                          >
                            <Icon size={18} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Subcategory Specific */}
              {showModal === 'subcategory' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 mr-1">اختر أيقونة التصنيف الفرعي</label>
                  <div className="grid grid-cols-6 gap-2 bg-gray-50 p-3 rounded-3xl max-h-48 overflow-y-auto custom-scrollbar">
                    {Object.keys(iconMap).map(iconName => {
                      const Icon = iconMap[iconName];
                      const isSelected = formData.icon === iconName;
                      return (
                        <button
                          key={iconName}
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`p-2 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100'}`}
                          title={iconLabels[iconName] || iconName}
                        >
                          <Icon size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Vehicle Specific */}
              {showModal === 'delivery_vehicle' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">بداية البنديرة (ج.م)</label>
                    <input
                      type="number"
                      value={formData.baseFare || 0}
                      onChange={(e) => setFormData({ ...formData, baseFare: Number(e.target.value) })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all text-right"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 mr-1">سعر الكيلومتر (ج.م)</label>
                    <input
                      type="number"
                      value={formData.perKmRate || 0}
                      onChange={(e) => setFormData({ ...formData, perKmRate: Number(e.target.value) })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 transition-all text-right"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full bg-red-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98] mt-4"
              >
                حفظ التغييرات
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!isOverlay) return (
    <div className="relative" dir="rtl">
      {content}
      {modals}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowRight size={24} className="text-gray-900" />
        </button>
        <h1 className="text-xl font-black text-gray-900">{title || 'هيكل التطبيق'}</h1>
      </div>

      {content}
      {modals}
    </motion.div>
  );
}
