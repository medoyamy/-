import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

export interface SubCategory {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface GroupedSubCategory {
  title: string;
  items: SubCategory[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  subCategories: SubCategory[];
  sectionId?: string; // Link to parent section
  groupedSubCategories?: GroupedSubCategory[];
}

export interface DeliveryCategory {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  order: number;
}

export interface DeliveryVehicle {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  order: number;
  categoryId?: string;
  baseFare?: number;
  perKmRate?: number;
}

export interface AppSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  order: number;
  type: 'categories' | 'banners' | 'featured_stores' | 'custom_content' | 'tabs' | 
        'delivery_categories' | 'vehicle_selector' | 'delivery_locations' | 'map_view' | 
        'kilometers_display' | 'fare_meter' | 'suggested_fare' | 'budget_selector' | 
        'shipment_description' | 'notes_input' | 'driver_selector' | 'shipment_details' | 
        'submit_button' | 'add_request_button' | 'publishing_box' |
        'top_tabs' | 'main_tabs' | 'sub_tabs' | 
        'my_posts' | 'general_feed' | 'nearby_feed' | 'special_feed' | 'friends_feed' | 'group_feed' | 'reels' |
        'profile_header' | 'profile_intro' | 'provider_settings' | 'stats_bar' | 'tab_content' | 
        'my_orders' | 'my_points' | 'my_friends' | 'my_subs' | 'my_ratings' | 'my_settings' | 'my_wallet' | 'my_pages' |
        'points_balance' | 'points_history' | 'points_offers' | 
        'subs_active' | 'subs_plans' | 'subscription_system' | 
        'coupons_list' | 'coupons_redeem' | 
        'friends_list' | 'friends_requests' | 
        'orders_active' | 'orders_history' |
        'profile_tabs' |
        'mgmt_subscriptions' | 'mgmt_points' | 'mgmt_coupons' | 'mgmt_accounting' | 'mgmt_users';
  layout: 'grid' | 'list' | 'scroll' | 'tabs' | 'form';
  tabId?: string; // Link to parent tab
  subTabId?: string; // Link to parent sub-tab (Category)
  config?: any;
}

export interface ServiceTab {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  order: number;
  userMode: 'user' | 'merchant' | 'provider' | 'driver' | 'deal_manager' | 'deal_provider' | 'admin' | 'restaurant' | 'all';
}

export interface AppService {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  order: number;
  userMode: 'user' | 'merchant' | 'provider' | 'driver' | 'deal_manager' | 'deal_provider' | 'admin' | 'restaurant' | 'all';
}

interface SettingsContextType {
  services: AppService[];
  appStructure: Record<string, AppSection[]>;
  categories: Record<string, Category[]>;
  serviceTabs: Record<string, ServiceTab[]>;
  deliveryCategories: DeliveryCategory[];
  deliveryVehicles: DeliveryVehicle[];
  
  // Service Management
  addService: (service: Omit<AppService, 'id' | 'order'>) => void;
  updateService: (serviceId: string, updates: Partial<AppService>) => void;
  deleteService: (serviceId: string) => void;
  reorderServices: (serviceId: string, direction: 'up' | 'down') => void;

  updateAppStructure: (serviceId: string, sections: AppSection[]) => void;
  addSection: (serviceId: string, section: Omit<AppSection, 'id' | 'order'>) => void;
  deleteSection: (serviceId: string, sectionId: string) => void;
  updateSection: (serviceId: string, sectionId: string, updates: Partial<AppSection>) => void;
  reorderSections: (serviceId: string, sectionId: string, direction: 'up' | 'down') => void;
  
  // Category Management
  addCategory: (serviceId: string, category: Omit<Category, 'id' | 'order' | 'subCategories'>) => void;
  updateCategory: (serviceId: string, categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (serviceId: string, categoryId: string) => void;
  reorderCategories: (serviceId: string, categoryId: string, direction: 'up' | 'down') => void;
  addSubCategory: (serviceId: string, categoryId: string, subCategory: Omit<SubCategory, 'id'>) => void;
  updateSubCategory: (serviceId: string, categoryId: string, subCategoryId: string, updates: Partial<SubCategory>) => void;
  deleteSubCategory: (serviceId: string, categoryId: string, subCategoryId: string) => void;
  reorderSubCategories: (serviceId: string, categoryId: string, subCategoryId: string, direction: 'up' | 'down') => void;

  // Tab Management
  addServiceTab: (serviceId: string, tab: Omit<ServiceTab, 'id' | 'order'>) => void;
  updateServiceTab: (serviceId: string, tabId: string, updates: Partial<ServiceTab>) => void;
  deleteServiceTab: (serviceId: string, tabId: string) => void;
  reorderServiceTabs: (serviceId: string, tabId: string, direction: 'up' | 'down') => void;

  // Delivery Management
  addDeliveryCategory: (category: Omit<DeliveryCategory, 'id' | 'order'>) => void;
  updateDeliveryCategory: (id: string, updates: Partial<DeliveryCategory>) => void;
  deleteDeliveryCategory: (id: string) => void;
  reorderDeliveryCategories: (id: string, direction: 'up' | 'down') => void;

  addDeliveryVehicle: (vehicle: Omit<DeliveryVehicle, 'id' | 'order'>) => void;
  updateDeliveryVehicle: (id: string, updates: Partial<DeliveryVehicle>) => void;
  deleteDeliveryVehicle: (id: string) => void;
  reorderDeliveryVehicles: (id: string, direction: 'up' | 'down') => void;
  resetToDefaults: () => void;
  resetServiceToDefaults: (serviceId: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultCategories: Record<string, Category[]> = {
  mercato: [
    { id: 'cat1', name: 'إلكترونيات', icon: 'Smartphone', color: 'bg-blue-500', isActive: true, order: 0, subCategories: [], sectionId: 'm1' },
    { id: 'cat2', name: 'أزياء', icon: 'ShoppingBag', color: 'bg-pink-500', isActive: true, order: 1, subCategories: [], sectionId: 'm1' },
  ],
  assisto: [
    { id: 'as1', name: 'سباكة', icon: 'Wrench', color: 'bg-blue-500', isActive: true, order: 0, subCategories: [
      { id: 'as1-1', name: 'تركيب فلاتر', icon: '💧', isActive: true },
      { id: 'as1-2', name: 'إصلاح تسريب', icon: '🔧', isActive: true },
      { id: 'as1-3', name: 'تأسيس سباكة', icon: '🏗️', isActive: true },
    ], sectionId: 'a1' },
    { id: 'as2', name: 'كهرباء', icon: 'Zap', color: 'bg-amber-500', isActive: true, order: 1, subCategories: [
      { id: 'as2-1', name: 'تركيب نجف', icon: '💡', isActive: true },
      { id: 'as2-2', name: 'إصلاح أعطال', icon: '⚡', isActive: true },
      { id: 'as2-3', name: 'تأسيس كهرباء', icon: '🔌', isActive: true },
    ], sectionId: 'a1' },
    { id: 'as3', name: 'تكييف وتبريد', icon: 'Wind', color: 'bg-cyan-500', isActive: true, order: 2, subCategories: [
      { id: 'as3-1', name: 'شحن فريون', icon: '❄️', isActive: true },
      { id: 'as3-2', name: 'تنظيف تكييف', icon: '🧹', isActive: true },
      { id: 'as3-3', name: 'إصلاح تكييف', icon: '🛠️', isActive: true },
    ], sectionId: 'a1' },
    { id: 'as4', name: 'نجارة', icon: 'Hammer', color: 'bg-orange-700', isActive: true, order: 3, subCategories: [
      { id: 'as4-1', name: 'تركيب أثاث', icon: '🪑', isActive: true },
      { id: 'as4-2', name: 'إصلاح أبواب', icon: '🚪', isActive: true },
      { id: 'as4-3', name: 'فك وتركيب', icon: '📦', isActive: true },
    ], sectionId: 'a1' },
    { id: 'as5', name: 'مهندسين', icon: 'GraduationCap', color: 'bg-blue-600', isActive: true, order: 4, subCategories: [
      { id: 'as5-1', name: 'مهندس مدني', icon: '🏗️', isActive: true },
      { id: 'as5-2', name: 'مهندس معماري', icon: '📐', isActive: true },
      { id: 'as5-3', name: 'مهندس ديكور', icon: '🛋️', isActive: true },
      { id: 'as5-4', name: 'مهندس كهرباء', icon: '💡', isActive: true },
      { id: 'as5-5', name: 'مهندس ميكانيكا', icon: '⚙️', isActive: true },
    ], sectionId: 'a1' },
    { id: 'as6', name: 'تنظيف', icon: 'Sparkles', color: 'bg-cyan-400', isActive: true, order: 5, subCategories: [
      { id: 'as6-1', name: 'تنظيف منازل', icon: '🏠', isActive: true },
      { id: 'as6-2', name: 'تنظيف سجاد', icon: '🧹', isActive: true },
      { id: 'as6-3', name: 'تنظيف واجهات', icon: '🏢', isActive: true },
    ], sectionId: 'a1' },
    { id: 'as7', name: 'نقاشة ودهانات', icon: 'Palette', color: 'bg-pink-500', isActive: true, order: 6, subCategories: [
      { id: 'as7-1', name: 'دهانات داخلية', icon: '🎨', isActive: true },
      { id: 'as7-2', name: 'دهانات خارجية', icon: '🏠', isActive: true },
      { id: 'as7-3', name: 'ورق حائط', icon: '📜', isActive: true },
    ], sectionId: 'a1' },
  ],
  freshmart: [
    { id: 'fm-rest', name: 'المطاعم و الكافيهات', icon: 'Utensils', color: 'bg-orange-500', isActive: true, order: 0, subCategories: [
      { id: 'fm-rest-1', name: 'وجبات سريعة', icon: 'Utensils', isActive: true },
      { id: 'fm-rest-2', name: 'كافيهات', icon: 'Coffee', isActive: true },
      { id: 'fm-rest-3', name: 'بيتزا', icon: 'Pizza', isActive: true },
      { id: 'fm-rest-4', name: 'مشويات', icon: 'Utensils', isActive: true },
    ], sectionId: 'f1' },
    { id: 'fm-super', name: 'السوبر ماركتس', icon: 'Store', color: 'bg-blue-600', isActive: true, order: 1, subCategories: [], sectionId: 'f1' },
    { id: 'fm-sweet', name: 'الحلويات', icon: 'Cake', color: 'bg-pink-500', isActive: true, order: 2, subCategories: [], sectionId: 'f1' },
    { id: 'fm-pharm', name: 'الصيداليات', icon: 'Pill', color: 'bg-emerald-500', isActive: true, order: 3, subCategories: [], sectionId: 'f1' },
    { id: 'fm-meat', name: 'اللحوم والدواجن', icon: 'Beef', color: 'bg-red-700', isActive: true, order: 4, subCategories: [], sectionId: 'f1' },
    { id: 'fm-veg', name: 'الخضروات والفواكه', icon: 'Flower2', color: 'bg-green-500', isActive: true, order: 5, subCategories: [], sectionId: 'f1' },
    { id: 'fm-fish', name: 'الأسماك', icon: 'Waves', color: 'bg-cyan-600', isActive: true, order: 6, subCategories: [], sectionId: 'f1' },
    { id: 'fm-bake', name: 'المخبوزات', icon: 'Croissant', color: 'bg-amber-600', isActive: true, order: 7, subCategories: [], sectionId: 'f1' },
    { id: 'fm-snack', name: 'التسالى والمحمصات', icon: 'Cookie', color: 'bg-yellow-700', isActive: true, order: 8, subCategories: [], sectionId: 'f1' },
    { id: 'fm-spice', name: 'العطاره والتوابل', icon: 'Leaf', color: 'bg-green-800', isActive: true, order: 9, subCategories: [], sectionId: 'f1' },
  ],
  deals: [],
  delivery: [],
  avalon: [
    { id: 'my-posts', sectionId: 'av_mt', name: 'منشوراتي', icon: 'User', order: 0, isActive: true, color: 'bg-red-500', subCategories: [] },
    { id: 'general', sectionId: 'av_mt', name: 'منشورات عامة', icon: 'LayoutGrid', order: 1, isActive: true, color: 'bg-blue-500', subCategories: [] },
    { id: 'nearby', sectionId: 'av_mt', name: 'قريبة', icon: 'Navigation', order: 2, isActive: true, color: 'bg-green-500', subCategories: [] },
    { id: 'special', sectionId: 'av_mt', name: 'خاصة', icon: 'Star', order: 3, isActive: true, color: 'bg-purple-500', subCategories: [] },
    { id: 'group', sectionId: 'av_mt', name: 'منشورات الطلبات الجماعية', icon: 'Layers', order: 4, isActive: true, color: 'bg-orange-500', subCategories: [] },
  ],
  jobs: [],
};

const defaultStructure: Record<string, AppSection[]> = {
  mercato: [
    { id: 'm1', name: 'الأقسام الرئيسية', icon: 'Grid', description: 'التصنيفات الأساسية للمنتجات', isActive: true, order: 0, type: 'categories', layout: 'grid', tabId: 'categories' },
    { id: 'm2', name: 'العروض المميزة', icon: 'Percent', description: 'أقوى الخصومات والعروض اليومية', isActive: true, order: 1, type: 'banners', layout: 'scroll', tabId: 'offers' },
    { id: 'm3', name: 'المتاجر الموثقة', icon: 'Shield', description: 'قائمة بأفضل المتاجر المعتمدة', isActive: true, order: 2, type: 'featured_stores', layout: 'list', tabId: 'categories' },
    { id: 'm4', name: 'الأعلى تقييماً', icon: 'Star', description: 'المتاجر والمنتجات الأعلى تقييماً', isActive: true, order: 3, type: 'featured_stores', layout: 'list', tabId: 'top-rated' },
  ],
  assisto: [
    { id: 'a1', name: 'تصنيفات الخدمات', icon: 'Briefcase', description: 'أنواع الخدمات المهنية المتاحة', isActive: true, order: 0, type: 'categories', layout: 'grid', tabId: 'categories' },
    { id: 'a2', name: 'مقدمي الخدمات', icon: 'Users', description: 'إدارة حسابات المهنيين', isActive: true, order: 1, type: 'featured_stores', layout: 'list', tabId: 'categories' },
    { id: 'a3', name: 'الأعلى تقييماً', icon: 'Star', description: 'أفضل مقدمي الخدمات تقييماً', isActive: true, order: 2, type: 'featured_stores', layout: 'list', tabId: 'top-rated' },
  ],
  freshmart: [
    { id: 'f1', name: 'الأقسام الرئيسية', icon: 'Grid', description: 'التصنيفات الأساسية للمنتجات والخدمات', isActive: true, order: 0, type: 'categories', layout: 'grid', tabId: 'categories' },
    { id: 'f2', name: 'المطاعم والوكلاء', icon: 'Store', description: 'إدارة شركاء الطعام', isActive: true, order: 1, type: 'featured_stores', layout: 'list', tabId: 'categories' },
    { id: 'f3', name: 'عروض اليوم', icon: 'Tag', description: 'خصومات حصرية على الوجبات', isActive: true, order: 2, type: 'banners', layout: 'scroll', tabId: 'offers' },
    { id: 'f4', name: 'الأكثر طلباً', icon: 'Star', description: 'الوجبات والمطاعم الأكثر شهرة', isActive: true, order: 3, type: 'featured_stores', layout: 'list', tabId: 'top-rated' },
  ],
  deals: [
    { id: 'd1', name: 'العروض النشطة', icon: 'Ticket', description: 'إدارة الكوبونات والصفقات الحالية', isActive: true, order: 0, type: 'banners', layout: 'scroll', tabId: 'individual' },
    { id: 'd2', name: 'الشركاء', icon: 'Handshake', description: 'إدارة العلامات التجارية المشاركة', isActive: true, order: 1, type: 'featured_stores', layout: 'list', tabId: 'individual' },
  ],
  delivery: [
    { id: 'v1', name: 'مربع تصنيفات', icon: 'Grid', description: 'توصيله، توصيل طلبات، شحن، مشاوير سفر، ونش', isActive: true, order: 0, type: 'delivery_categories', layout: 'grid', tabId: 'delivery-services' },
    { id: 'tt1', name: 'مربع تبويبات عليا', icon: 'Layers', description: 'التنقل الرئيسي للخدمة', isActive: true, order: 1, type: 'top_tabs', layout: 'scroll', tabId: 'delivery-services' },
    { id: 'mt1', name: 'مربع تبويبات رئيسية', icon: 'Grid', description: 'تصنيفات رئيسية داخل التبويب', isActive: true, order: 2, type: 'main_tabs', layout: 'scroll', tabId: 'delivery-services' },
    { id: 'st1', name: 'مربع تبويبات فرعية', icon: 'Layers', description: 'تصنيفات فرعية للتصنيف النشط', isActive: true, order: 3, type: 'sub_tabs', layout: 'scroll', tabId: 'delivery-services' },
    { id: 'v0', name: 'مربع النشر', icon: 'SquarePen', description: 'نشر طلبات أو عروض', isActive: true, order: 4, type: 'publishing_box', layout: 'form', tabId: 'delivery-services' },
    { id: 'v2', name: 'مربع اختيار نوع المركبه', icon: 'Truck', description: 'عربيه، عجله، موتسيكل، اسكوتر، توكتوك، الخ', isActive: true, order: 5, type: 'vehicle_selector', layout: 'grid', tabId: 'delivery-services' },
    { id: 'v3', name: 'مربع مواقع التوصيل', icon: 'MapPin', description: 'تحديد أماكن التوصيل والأسماء والأرقام', isActive: true, order: 2, type: 'delivery_locations', layout: 'form', tabId: 'delivery-services' },
    { id: 'v4', name: 'مربع الخريطه', icon: 'Map', description: 'عرض الخريطة لتحديد المواقع', isActive: true, order: 3, type: 'map_view', layout: 'form', tabId: 'delivery-services' },
    { id: 'v5', name: 'مربع الكيلومترات', icon: 'Navigation', isActive: true, order: 4, type: 'kilometers_display', layout: 'form', tabId: 'delivery-services', description: 'عرض المسافة المقطوعة' },
    { id: 'v6', name: 'مربع البنديره', icon: 'DollarSign', isActive: true, order: 5, type: 'fare_meter', layout: 'form', tabId: 'delivery-services', description: 'بداية البنديرة وسعر الكيلومتر' },
    { id: 'v7', name: 'مربع الاجره المقترحه', icon: 'Zap', isActive: true, order: 6, type: 'suggested_fare', layout: 'form', tabId: 'delivery-services', description: 'حساب الأجرة المقترحة' },
    { id: 'v8', name: 'مربع تحديد ميزانيتك', icon: 'Wallet', isActive: true, order: 7, type: 'budget_selector', layout: 'form', tabId: 'delivery-services', description: 'تحديد ميزانية العميل' },
    { id: 'v9', name: 'مربع وصف الشحنه', icon: 'Package', isActive: true, order: 8, type: 'shipment_description', layout: 'form', tabId: 'delivery-services', description: 'وصف محتويات الشحنة' },
    { id: 'v10', name: 'مربع ملاحظات', icon: 'FileText', isActive: true, order: 9, type: 'notes_input', layout: 'form', tabId: 'delivery-services', description: 'ملاحظات إضافية' },
    { id: 'v11', name: 'مربع اختيار سائق', icon: 'UserPlus', isActive: true, order: 10, type: 'driver_selector', layout: 'list', tabId: 'delivery-services', description: 'اختيار سائق من الأصدقاء' },
    { id: 'v14', name: 'مربع ارسال الطلب', icon: 'Send', isActive: true, order: 13, type: 'submit_button', layout: 'form', tabId: 'delivery-services', description: 'زر إرسال الطلب النهائي' },
  ],
  avalon: [
    // Top Navigation (Visible on both Home and Map)
    { id: 'av_tt_home', name: 'شريط التنقل العلوي', icon: 'Layers', description: 'الرئيسية والخريطة', isActive: true, order: 0, type: 'top_tabs', layout: 'scroll', tabId: 'home' },
    { id: 'av_tt_map', name: 'شريط التنقل العلوي', icon: 'Layers', description: 'الرئيسية والخريطة', isActive: true, order: 0, type: 'top_tabs', layout: 'scroll', tabId: 'map' },
    
    // Main Tabs (Only on Home)
    { id: 'av_mt', name: 'أقسام المحتوى', icon: 'Grid', description: 'منشوراتي، العامة، القريبة، الخ', isActive: true, order: 1, type: 'main_tabs', layout: 'scroll', tabId: 'home' },
    
    // Sections for "My Posts" sub-tab (subTabId: 'my-posts')
    { id: 'av_pub', name: 'مربع النشر', icon: 'SquarePen', description: 'نشر منشورات جديدة', isActive: true, order: 2, type: 'publishing_box', layout: 'form', tabId: 'home', subTabId: 'my-posts' },
    { id: 'av_my_feed', name: 'منشورات العميل', icon: 'User', description: 'عرض منشوراتك الخاصة', isActive: true, order: 3, type: 'my_posts', layout: 'list', tabId: 'home', subTabId: 'my-posts' },
    
    // Sections for other sub-tabs
    { id: 'av_gen_feed', name: 'منشورات عامة', icon: 'LayoutGrid', description: 'كل منشورات المنصة', isActive: true, order: 4, type: 'general_feed', layout: 'list', tabId: 'home', subTabId: 'general' },
    { id: 'av_near_feed', name: 'قريبة', icon: 'Navigation', description: 'منشورات قريبة منك', isActive: true, order: 5, type: 'nearby_feed', layout: 'list', tabId: 'home', subTabId: 'nearby' },
    { id: 'av_spec_feed', name: 'خاصة', icon: 'Star', description: 'بناءً على اهتماماتك', isActive: true, order: 6, type: 'special_feed', layout: 'list', tabId: 'home', subTabId: 'special' },
    { id: 'av_friend_feed', name: 'الأصدقاء', icon: 'Users', description: 'منشورات أصدقائك', isActive: true, order: 7, type: 'friends_feed', layout: 'list', tabId: 'home', subTabId: 'friends' },
    { id: 'av_group_feed', name: 'منشورات الطلبات الجماعية', icon: 'Layers', description: 'طلبات جماعية نشطة', isActive: true, order: 8, type: 'group_feed', layout: 'list', tabId: 'home', subTabId: 'group' },
    
    { id: 'av_tt_reels', name: 'شريط التنقل العلوي', icon: 'Layers', description: 'الرئيسية والخريطة', isActive: true, order: 0, type: 'top_tabs', layout: 'scroll', tabId: 'reels' },
    { id: 'av_reels', name: 'ريلز التجار', icon: 'Video', description: 'عروض فيديو حصرية', isActive: true, order: 1, type: 'reels', layout: 'list', tabId: 'reels' },
    
    // Map Tab Content
    { id: 'av_map_title', name: 'خريطة الأفالون', icon: 'Map', description: 'عنوان الخريطة', isActive: true, order: 1, type: 'custom_content', layout: 'form', tabId: 'map' },
    { id: 'av_map_view', name: 'الخريطة', icon: 'Map', description: 'عرض المنشورات على الخريطة', isActive: true, order: 2, type: 'map_view', layout: 'form', tabId: 'map' },

    // Management Tab Sections
    { id: 'av_tt_mgmt', name: 'شريط التنقل العلوي', icon: 'Layers', description: 'التنقل بين أدوات الإدارة', isActive: true, order: 0, type: 'top_tabs', layout: 'scroll', tabId: 'management' },
    { id: 'av_m_subs', name: 'إدارة الاشتراكات', icon: 'Star', description: 'متابعة وتعديل أنظمة الاشتراكات', isActive: true, order: 1, type: 'mgmt_subscriptions', layout: 'list', tabId: 'management' },
    { id: 'av_m_points', name: 'إدارة النقاط', icon: 'Coins', description: 'التحكم في النقاط وكروت الشحن', isActive: true, order: 2, type: 'mgmt_points', layout: 'list', tabId: 'management' },
    { id: 'av_m_coupons', name: 'إدارة الكوبونات', icon: 'Ticket', description: 'إنشاء وتعديل الكوبونات', isActive: true, order: 3, type: 'mgmt_coupons', layout: 'list', tabId: 'management' },
    { id: 'av_m_accounting', name: 'الإدارة المالية', icon: 'DollarSign', description: 'متابعة الرصيد والعمليات المالية', isActive: true, order: 4, type: 'mgmt_accounting', layout: 'list', tabId: 'management' },
    
    // Profile Tab Sections
    { id: 'av_tt_profile', name: 'شريط التنقل العلوي', icon: 'Layers', description: 'التنقل في البروفايل', isActive: true, order: 0, type: 'top_tabs', layout: 'scroll', tabId: 'profile' },
    { id: 'av_p_tabs', name: 'أقسام البروفايل', icon: 'LayoutGrid', description: 'التنقل بين أقسام الحساب', isActive: true, order: 1, type: 'profile_tabs', layout: 'scroll', tabId: 'profile' },
    { id: 'av_p_intro', name: 'البروفايل', icon: 'User', description: 'معلومات الحساب', isActive: true, order: 2, type: 'profile_intro', layout: 'form', tabId: 'profile', subTabId: 'my-profile' },
    { id: 'av_p_points', name: 'النقاط', icon: 'Coins', description: 'رصيد النقاط', isActive: true, order: 3, type: 'points_balance', layout: 'form', tabId: 'profile', subTabId: 'my-points' },
    { id: 'av_p_coupons', name: 'الكوبونات', icon: 'Ticket', description: 'كوبوناتي المتاحة', isActive: true, order: 4, type: 'coupons_list', layout: 'list', tabId: 'profile', subTabId: 'my-coupons' },
    { id: 'av_p_orders', name: 'الطلبات', icon: 'Package', description: 'طلباتي النشطة', isActive: true, order: 5, type: 'orders_active', layout: 'list', tabId: 'profile', subTabId: 'my-orders' },
    { id: 'av_p_subs', name: 'الاشتراكات', icon: 'Star', description: 'اشتراكاتي النشطة', isActive: true, order: 6, type: 'subscription_system', layout: 'list', tabId: 'profile', subTabId: 'my-subs' },
    { id: 'av_p_friends', name: 'الأصدقاء', icon: 'Users', description: 'قائمة الأصدقاء', isActive: true, order: 7, type: 'friends_list', layout: 'grid', tabId: 'profile', subTabId: 'my-friends' },
    { id: 'av_p_settings', name: 'الإعدادات', icon: 'SettingsIcon', description: 'إعدادات الحساب', isActive: true, order: 8, type: 'my_settings', layout: 'form', tabId: 'profile', subTabId: 'my-profile' },
  ],
  jobs: [
    { id: 'j_tt', name: 'مربع التبويبات العليا', icon: 'Layers', description: 'التنقل الرئيسي بين الوظائف والطلبات والخريطة', isActive: true, order: 0, type: 'top_tabs', layout: 'scroll', tabId: 'available' },
    { id: 'j1', name: 'تصنيفات الوظائف', icon: 'Briefcase', description: 'المجالات المهنية المتاحة', isActive: true, order: 1, type: 'categories', layout: 'grid', tabId: 'available' },
    { id: 'j2', name: 'فرص عمل عاجلة', icon: 'Clock', description: 'وظائف تتطلب التقديم الفوري', isActive: true, order: 2, type: 'banners', layout: 'scroll', tabId: 'available' },
    { id: 'j3', name: 'أفضل الشركات', icon: 'Store', description: 'شركات توظف حالياً', isActive: true, order: 3, type: 'featured_stores', layout: 'list', tabId: 'available' },
  ],
};

const defaultServiceTabs: Record<string, ServiceTab[]> = {
  mercato: [
    { id: 'categories', label: 'الأقسام', icon: 'LayoutGrid', isActive: true, order: 0, userMode: 'user' },
    { id: 'map', label: 'الخريطة', icon: 'Map', isActive: true, order: 1, userMode: 'user' },
    { id: 'offers', label: 'العروض', icon: 'Tag', isActive: true, order: 2, userMode: 'user' },
    { id: 'group-requests', label: 'طلبات جماعية', icon: 'Users', isActive: true, order: 3, userMode: 'user' },
    { id: 'group-offers', label: 'عروض جماعية', icon: 'BadgePercent', isActive: true, order: 4, userMode: 'user' },
    { id: 'top-rated', label: 'الأعلى تقييماً', icon: 'Star', isActive: true, order: 5, userMode: 'user' },
    { id: 'rewards', label: 'المكافآت', icon: 'Gift', isActive: true, order: 6, userMode: 'user' },
    { id: 'filters', label: 'فلاتر', icon: 'Filter', isActive: true, order: 7, userMode: 'user' },
    { id: 'publish', label: 'مربع نشر', icon: 'SquarePen', isActive: true, order: 8, userMode: 'user' },
  ],
  assisto: [
    { id: 'categories', label: 'الأقسام', icon: 'LayoutGrid', isActive: true, order: 0, userMode: 'user' },
    { id: 'map', label: 'الخريطة', icon: 'Map', isActive: true, order: 1, userMode: 'user' },
    { id: 'top-rated', label: 'الأعلى تقييماً', icon: 'Star', isActive: true, order: 2, userMode: 'user' },
    { id: 'publish', label: 'مربع نشر', icon: 'SquarePen', isActive: true, order: 3, userMode: 'user' },
  ],
  freshmart: [
    { id: 'categories', label: 'الأقسام', icon: 'LayoutGrid', isActive: true, order: 0, userMode: 'user' },
    { id: 'map', label: 'الخريطة', icon: 'Map', isActive: true, order: 1, userMode: 'user' },
    { id: 'offers', label: 'العروض', icon: 'Tag', isActive: true, order: 2, userMode: 'user' },
    { id: 'top-rated', label: 'الأعلى تقييماً', icon: 'Star', isActive: true, order: 3, userMode: 'user' },
    { id: 'publish', label: 'مربع نشر', icon: 'SquarePen', isActive: true, order: 4, userMode: 'user' },
    { id: 'my-orders', label: 'الطلبات', icon: 'Package', isActive: true, order: 0, userMode: 'restaurant' },
    { id: 'my-menu', label: 'المنيو', icon: 'Utensils', isActive: true, order: 1, userMode: 'restaurant' },
    { id: 'my-stats', label: 'الأرباح والإحصائيات', icon: 'BarChart3', isActive: true, order: 2, userMode: 'restaurant' },
    { id: 'my-subs', label: 'اشتراكات العملاء', icon: 'Users', isActive: true, order: 3, userMode: 'restaurant' },
    { id: 'settings', label: 'إعدادات المطعم', icon: 'Settings', isActive: true, order: 4, userMode: 'restaurant' },
  ],
  deals: [
    { id: 'individual', label: 'الأقسام', icon: 'LayoutGrid', isActive: true, order: 0, userMode: 'user' },
    { id: 'map', label: 'الخريطة', icon: 'Map', isActive: true, order: 1, userMode: 'user' },
    { id: 'rewards', label: 'المكافآت', icon: 'Trophy', isActive: true, order: 2, userMode: 'user' },
  ],
  avalon: [
    { id: 'home', label: 'الرئيسية', icon: 'Home', isActive: true, order: 0, userMode: 'user' },
    { id: 'reels', label: 'ريلز', icon: 'Video', isActive: true, order: 1, userMode: 'user' },
    { id: 'map', label: 'الخريطة', icon: 'Map', isActive: true, order: 2, userMode: 'user' },
    {id: 'management', label: 'الإدارة', icon: 'ShieldCheck', isActive: true, order: 10, userMode: 'admin' },
    { id: 'profile', label: 'البروفايل', icon: 'User', isActive: true, order: 11, userMode: 'user' },
  ],
  jobs: [
    { id: 'available', label: 'وظائف جاهزة', icon: 'Briefcase', isActive: true, order: 0, userMode: 'user' },
    { id: 'requests', label: 'طلبات وظائف', icon: 'User', isActive: true, order: 1, userMode: 'user' },
    { id: 'map', label: 'الخريطة', icon: 'Map', isActive: true, order: 2, userMode: 'user' },
    { id: 'publish', label: 'مربع نشر', icon: 'SquarePen', isActive: true, order: 3, userMode: 'user' },
  ],
  delivery: [
    { id: 'delivery-services', label: 'خدمات التوصيل', icon: 'Truck', isActive: true, order: 0, userMode: 'user' },
    { id: 'subscription-offers', label: 'عروض الاشتراكات', icon: 'BadgePercent', isActive: true, order: 1, userMode: 'user' },
    { id: 'best-drivers', label: 'افضل السائقين', icon: 'Star', isActive: true, order: 2, userMode: 'user' },
  ],
};

export const iconLabels: Record<string, string> = {
  Hammer: 'شاكوش/نجارة',
  Wind: 'رياح/تكييف',
  SquarePen: 'مربع نشر',
  Users: 'طلبات جماعية/مستخدمين/أصدقائي',
  Gift: 'المكافآت',
  Filter: 'فلاتر',
  Map: 'خريطة',
  Tag: 'وسم/عروض',
  Trophy: 'كأس/مكافآت',
  Smartphone: 'هاتف',
  ShoppingBag: 'حقيبة تسوق',
  Briefcase: 'حقيبة عمل',
  Utensils: 'أدوات طعام',
  Store: 'متجر',
  Ticket: 'تذكرة',
  Handshake: 'مصافحة/صفقات',
  Car: 'سيارة/توصيل',
  Shield: 'درع/حماية',
  Grid: 'شبكة أقسام',
  Percent: 'نسبة مئوية',
  Clock: 'ساعة',
  Layers: 'طبقات',
  Package: 'طرد/منتج/طلباتي',
  SettingsIcon: 'إعدادات',
  ClipboardList: 'قائمة مهام',
  BarChart3: 'إحصائيات',
  Circle: 'دائرة',
  Home: 'الرئيسية',
  Coins: 'عملات/نقاطي',
  Star: 'نجمة/اشتراكاتي/تقييماتي',
  Shirt: 'ملابس',
  Laptop: 'كمبيوتر محمول',
  Flower2: 'زهور/جمال',
  BookOpen: 'كتب/تعليم',
  Armchair: 'أثاث',
  Sparkles: 'تألق/جديد',
  Gamepad2: 'ألعاب',
  Palette: 'فن/ألوان',
  Zap: 'سريع/طاقة',
  Truck: 'مربع خدمات التوصيل',
  Plane: 'طيران/سفر',
  Wrench: 'صيانة/أدوات',
  Wallet: 'محفظة/ميزانية',
  FileText: 'ملاحظات/نص',
  PenTool: 'كتابة/تعديل',
  Send: 'إرسال',
  DollarSign: 'عملة/بنديرة',
  Navigation: 'ملاحة/كيلومترات',
  BadgePercent: 'خصم/اشتراك',
  LayoutGrid: 'شبكة مربعات',
  Bike: 'دراجة',
  Search: 'بحث',
  ArrowRight: 'سهم لليمين',
  Rocket: 'صاروخ/انطلاق',
  Info: 'معلومات',
  MessageSquare: 'رسائل',
  UserPlus: 'إضافة مستخدم',
  Trash2: 'حذف',
  Plus: 'إضافة',
  MapPin: 'دبوس الخريطة',
  CheckCircle2: 'تم/مكتمل',
  ChevronLeft: 'سهم لليسار',
  Video: 'فيديو',
  Beef: 'لحوم',
  Waves: 'أسماك',
  Croissant: 'مخبوزات',
  Cookie: 'تسالى',
  Leaf: 'عطاره',
  Pill: 'صيدلية',
  Cake: 'حلويات',
  None: 'بدون ايقونة'
};

const defaultServices: AppService[] = [
  { id: 'avalon', name: 'افالون', icon: 'Shield', isActive: true, order: 0, userMode: 'admin' },
  { id: 'freshmart', name: 'فريش مارت', icon: 'Utensils', isActive: true, order: 1, userMode: 'restaurant' },
  { id: 'mercato', name: 'ميركاتو', icon: 'Store', isActive: true, order: 2, userMode: 'merchant' },
  { id: 'assisto', name: 'أسيستو', icon: 'Briefcase', isActive: true, order: 3, userMode: 'provider' },
  { id: 'deals', name: 'ديلز', icon: 'Handshake', isActive: true, order: 4, userMode: 'deal_manager' },
  { id: 'jobs', name: 'فرص عمل', icon: 'Briefcase', isActive: true, order: 5, userMode: 'provider' },
  { id: 'delivery', name: 'وصلنى', icon: 'Car', isActive: true, order: 6, userMode: 'driver' }
];

const defaultDeliveryCategories: DeliveryCategory[] = [
  { id: 'people', name: 'توصيله', icon: 'Car', order: 0, isActive: true },
  { id: 'orders', name: 'توصيل طلبات', icon: 'Package', order: 1, isActive: true },
  { id: 'items', name: 'شحن', icon: 'Truck', order: 2, isActive: true },
  { id: 'travel', name: 'مشاوير سفر', icon: 'Navigation', order: 3, isActive: true },
  { id: 'tow', name: 'ونش', icon: 'Wrench', order: 4, isActive: true },
];

const defaultDeliveryVehicles: DeliveryVehicle[] = [
  { id: 'car', name: 'عربيه', icon: 'Car', order: 0, isActive: true },
  { id: 'bike', name: 'عجله', icon: 'Bike', order: 1, isActive: true },
  { id: 'moto', name: 'موتسيكل', icon: 'Bike', order: 2, isActive: true },
  { id: 'scooter', name: 'اسكوتر', icon: 'Bike', order: 3, isActive: true },
  { id: 'tuk', name: 'توكتوك', icon: 'Car', order: 4, isActive: true },
  { id: 'minibus', name: 'مينى باص', icon: 'Truck', order: 5, isActive: true },
  { id: 'bus', name: 'باص', icon: 'Truck', order: 6, isActive: true },
  { id: 'tri', name: 'تروسيكل', icon: 'Truck', order: 7, isActive: true },
  { id: 'pickup', name: 'ربع نقل', icon: 'Truck', order: 8, isActive: true },
  { id: 'half', name: 'نص نقل', icon: 'Truck', order: 9, isActive: true },
  { id: 'jumbo', name: 'جامبو', icon: 'Truck', order: 10, isActive: true },
  { id: 'winch_f', name: 'ونش أثاث', icon: 'Wrench', order: 11, isActive: true },
  { id: 'winch_c', name: 'ونش سيارات', icon: 'Wrench', order: 12, isActive: true },
];

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<AppService[]>([]);
  const [appStructure, setAppStructure] = useState<Record<string, AppSection[]>>({});
  const [categories, setCategories] = useState<Record<string, Category[]>>({});
  const [serviceTabs, setServiceTabs] = useState<Record<string, ServiceTab[]>>({});
  const [deliveryCategories, setDeliveryCategories] = useState<DeliveryCategory[]>([]);
  const [deliveryVehicles, setDeliveryVehicles] = useState<DeliveryVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestore Listeners
  useEffect(() => {
    const unsubServices = onSnapshot(doc(db, 'settings', 'services'), (snapshot) => {
      if (snapshot.exists()) {
        setServices(snapshot.data().items || defaultServices);
      } else {
        setServices(defaultServices);
        // Only attempt to create if we are sure it's missing and we might be admin
        // But better to let the admin page handle initialization
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/services');
      setServices(defaultServices);
    });

    const unsubStructure = onSnapshot(doc(db, 'settings', 'appStructure'), (snapshot) => {
      if (snapshot.exists()) {
        setAppStructure(snapshot.data() || defaultStructure);
      } else {
        setAppStructure(defaultStructure);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/appStructure');
      setAppStructure(defaultStructure);
    });

    const unsubCategories = onSnapshot(doc(db, 'settings', 'categories'), (snapshot) => {
      if (snapshot.exists()) {
        setCategories(snapshot.data() || defaultCategories);
      } else {
        setCategories(defaultCategories);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/categories');
      setCategories(defaultCategories);
    });

    const unsubTabs = onSnapshot(doc(db, 'settings', 'serviceTabs'), (snapshot) => {
      if (snapshot.exists()) {
        setServiceTabs(snapshot.data() || defaultServiceTabs);
      } else {
        setServiceTabs(defaultServiceTabs);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/serviceTabs');
      setServiceTabs(defaultServiceTabs);
    });

    const unsubDelivery = onSnapshot(doc(db, 'settings', 'delivery'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDeliveryCategories(data.categories || defaultDeliveryCategories);
        setDeliveryVehicles(data.vehicles || defaultDeliveryVehicles);
      } else {
        setDeliveryCategories(defaultDeliveryCategories);
        setDeliveryVehicles(defaultDeliveryVehicles);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/delivery');
      setDeliveryCategories(defaultDeliveryCategories);
      setDeliveryVehicles(defaultDeliveryVehicles);
      setLoading(false);
    });

    return () => {
      unsubServices();
      unsubStructure();
      unsubCategories();
      unsubTabs();
      unsubDelivery();
    };
  }, []);

  // Migration effect to fix existing data (now runs on Firestore data)
  useEffect(() => {
    if (loading) return;
    
    let changed = false;
    const updatedStructure = { ...appStructure };
    const updatedCategories = { ...categories };
    const updatedTabs = { ...serviceTabs };

    // 1. Fix appStructure
    Object.keys(defaultStructure).forEach(serviceId => {
      const currentSections = updatedStructure[serviceId] || [];
      const isOldAvalon = serviceId === 'avalon' && (!currentSections.some(s => s.id === 'av_p_tabs') || currentSections.some(s => s.tabId === 'settings'));
      const isOldProfile = serviceId === 'profile' && (
        !currentSections.some(s => s.id === 'p_points_bal') || 
        currentSections.some(s => s.id === 'p_intro' && s.tabId === 'all') ||
        !currentSections.some(s => s.id === 'p_provider_settings') ||
        !currentSections.some(s => s.id === 'p_publish') ||
        currentSections.filter(s => s.type === 'top_tabs').length > 1 ||
        new Set(currentSections.map(s => s.id)).size !== currentSections.length
      );
      
      if (currentSections.length === 0 || isOldAvalon || isOldProfile) {
        console.log(`Resetting structure for ${serviceId}. Reason: ${currentSections.length === 0 ? 'Empty' : isOldAvalon ? 'Old Avalon' : 'Old Profile'}`);
        updatedStructure[serviceId] = defaultStructure[serviceId];
        changed = true;
      }
    });

    // 2. Fix categories
    Object.keys(defaultCategories).forEach(serviceId => {
      const currentCategories = updatedCategories[serviceId] || [];
      const isOldAvalon = serviceId === 'avalon' && (!currentCategories.some(c => c.id === 'my-posts') || currentCategories.some(c => c.id === 'friends'));
      const isOldFreshmart = serviceId === 'freshmart' && !currentCategories.some(c => c.id === 'fm-rest');
      const isOldAssisto = serviceId === 'assisto' && (!currentCategories.some(c => c.id === 'as5') || currentCategories.find(c => c.id === 'as5')?.subCategories.some(s => s.icon === '🏠'));
      
      if (currentCategories.length === 0 || isOldAvalon || isOldFreshmart || isOldAssisto) {
        updatedCategories[serviceId] = defaultCategories[serviceId];
        // Also reset structure if categories are reset to ensure IDs match
        updatedStructure[serviceId] = defaultStructure[serviceId];
        changed = true;
      }
    });

    // 3. Fix serviceTabs
    Object.keys(defaultServiceTabs).forEach(serviceId => {
      const currentTabs = updatedTabs[serviceId] || [];
      const hasDuplicates = new Set(currentTabs.map(t => t.id)).size !== currentTabs.length;
      const isOldAvalon = serviceId === 'avalon' && (
        !currentTabs.some(t => t.id === 'home') || 
        !currentTabs.some(t => t.id === 'profile') ||
        currentTabs.some(t => t.id === 'settings')
      );
      const isOldProfile = serviceId === 'profile' && (
        !currentTabs.some(t => t.id === 'my-coupons') || 
        hasDuplicates ||
        currentTabs.length > 10
      );
      
      if (currentTabs.length === 0 || isOldAvalon || isOldProfile) {
        updatedTabs[serviceId] = defaultServiceTabs[serviceId];
        changed = true;
      }
    });

    if (changed) {
      console.log('Settings migration needed. Updating Firestore...');
      const isAdminEmail = auth.currentUser?.email === 'mo7amdevo@gmail.com' || auth.currentUser?.email === 'mo7amedevo@gmail.com';
      if (isAdminEmail) {
        setDoc(doc(db, 'settings', 'appStructure'), updatedStructure).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'settings/appStructure'));
        setDoc(doc(db, 'settings', 'categories'), updatedCategories).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'settings/categories'));
        setDoc(doc(db, 'settings', 'serviceTabs'), updatedTabs).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'settings/serviceTabs'));
      }
    }
  }, [loading]);

  const addService = async (service: Omit<AppService, 'id' | 'order'>) => {
    try {
      const docRef = doc(db, 'settings', 'services');
      const snapshot = await getDoc(docRef);
      const currentItems = snapshot.exists() ? snapshot.data().items || [] : [];
      
      const newService: AppService = {
        ...service,
        id: Math.random().toString(36).substr(2, 9),
        order: currentItems.length,
      };
      
      await setDoc(docRef, {
        items: [...currentItems, newService]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/services');
    }
  };

  const updateService = async (serviceId: string, updates: Partial<AppService>) => {
    try {
      const docRef = doc(db, 'settings', 'services');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentItems = snapshot.data().items || [];
      const updatedItems = currentItems.map((s: any) => 
        s.id === serviceId ? { ...s, ...updates } : s
      );
      
      await setDoc(docRef, { items: updatedItems });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/services/${serviceId}`);
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const docRef = doc(db, 'settings', 'services');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentItems = snapshot.data().items || [];
      const updatedItems = currentItems.filter((s: any) => s.id !== serviceId);
      
      await setDoc(docRef, { items: updatedItems });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/services/${serviceId}`);
    }
  };

  const reorderServices = async (serviceId: string, direction: 'up' | 'down') => {
    try {
      const docRef = doc(db, 'settings', 'services');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentItems = [...(snapshot.data().items || [])];
      const index = currentItems.findIndex(s => s.id === serviceId);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === currentItems.length - 1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentItems[index], currentItems[targetIndex]] = [currentItems[targetIndex], currentItems[index]];
      
      const orderedItems = currentItems.map((s, i) => ({ ...s, order: i }));
      await setDoc(docRef, { items: orderedItems });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/services');
    }
  };

  const updateAppStructure = async (serviceId: string, sections: AppSection[]) => {
    try {
      await setDoc(doc(db, 'settings', 'appStructure'), {
        [serviceId]: sections
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/appStructure');
    }
  };

  const addSection = async (serviceId: string, section: Omit<AppSection, 'id' | 'order'>) => {
    try {
      const docRef = doc(db, 'settings', 'appStructure');
      const snapshot = await getDoc(docRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const currentSections = currentData[serviceId] || [];
      
      const newSection: AppSection = {
        ...section,
        id: Math.random().toString(36).substr(2, 9),
        order: currentSections.length,
      };
      
      await setDoc(docRef, {
        [serviceId]: [...currentSections, newSection]
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/appStructure');
    }
  };

  const deleteSection = async (serviceId: string, sectionId: string) => {
    try {
      const docRef = doc(db, 'settings', 'appStructure');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentSections = currentData[serviceId] || [];
      const newSections = currentSections.filter((s: any) => s.id !== sectionId);
      
      await setDoc(docRef, {
        [serviceId]: newSections
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/appStructure');
    }
  };

  const updateSection = async (serviceId: string, sectionId: string, updates: Partial<AppSection>) => {
    try {
      const docRef = doc(db, 'settings', 'appStructure');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentSections = currentData[serviceId] || [];
      const newSections = currentSections.map((s: any) => s.id === sectionId ? { ...s, ...updates } : s);
      
      await setDoc(docRef, {
        [serviceId]: newSections
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/appStructure');
    }
  };

  const reorderSections = async (serviceId: string, sectionId: string, direction: 'up' | 'down') => {
    try {
      const docRef = doc(db, 'settings', 'appStructure');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentSections = [...(currentData[serviceId] || [])];
      const index = currentSections.findIndex(s => s.id === sectionId);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === currentSections.length - 1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentSections[index], currentSections[targetIndex]] = [currentSections[targetIndex], currentSections[index]];
      
      const orderedSections = currentSections.map((s, i) => ({ ...s, order: i }));
      await setDoc(docRef, {
        [serviceId]: orderedSections
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/appStructure');
    }
  };

  const addCategory = async (serviceId: string, category: Omit<Category, 'id' | 'order' | 'subCategories' | 'groupedSubCategories'>) => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      const snapshot = await getDoc(docRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const currentCategories = currentData[serviceId] || [];
      
      const newCategory: Category = {
        ...category,
        id: Math.random().toString(36).substr(2, 9),
        order: currentCategories.length,
        subCategories: [],
        groupedSubCategories: [],
      };
      
      await setDoc(docRef, {
        [serviceId]: [...currentCategories, newCategory]
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/categories');
    }
  };

  const updateCategory = async (serviceId: string, categoryId: string, updates: Partial<Category>) => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = currentData[serviceId] || [];
      const newCategories = currentCategories.map((c: any) => c.id === categoryId ? { ...c, ...updates } : c);
      
      await setDoc(docRef, {
        [serviceId]: newCategories
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/categories');
    }
  };

  const deleteCategory = async (serviceId: string, categoryId: string) => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = currentData[serviceId] || [];
      const newCategories = currentCategories.filter((c: any) => c.id !== categoryId);
      
      await setDoc(docRef, {
        [serviceId]: newCategories
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/categories');
    }
  };

  const reorderCategories = async (serviceId: string, categoryId: string, direction: 'up' | 'down') => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = [...(currentData[serviceId] || [])];
      const index = currentCategories.findIndex(c => c.id === categoryId);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === currentCategories.length - 1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentCategories[index], currentCategories[targetIndex]] = [currentCategories[targetIndex], currentCategories[index]];
      
      const orderedCategories = currentCategories.map((c, i) => ({ ...c, order: i }));
      await setDoc(docRef, {
        [serviceId]: orderedCategories
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/categories');
    }
  };

  const addSubCategory = async (serviceId: string, categoryId: string, subCategory: Omit<SubCategory, 'id'>) => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = currentData[serviceId] || [];
      
      const newSub: SubCategory = {
        ...subCategory,
        id: Math.random().toString(36).substr(2, 9),
      };
      
      const newCategories = currentCategories.map((c: any) => 
        c.id === categoryId ? { ...c, subCategories: [...(c.subCategories || []), newSub] } : c
      );
      
      await setDoc(docRef, {
        [serviceId]: newCategories
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/categories');
    }
  };

  const updateSubCategory = async (serviceId: string, categoryId: string, subId: string, updates: Partial<SubCategory>) => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = currentData[serviceId] || [];
      
      const newCategories = currentCategories.map((c: any) => 
        c.id === categoryId ? { 
          ...c, 
          subCategories: (c.subCategories || []).map((s: any) => s.id === subId ? { ...s, ...updates } : s) 
        } : c
      );
      
      await setDoc(docRef, {
        [serviceId]: newCategories
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/categories');
    }
  };

  const deleteSubCategory = async (serviceId: string, categoryId: string, subId: string) => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = currentData[serviceId] || [];
      
      const newCategories = currentCategories.map((c: any) => 
        c.id === categoryId ? { 
          ...c, 
          subCategories: (c.subCategories || []).filter((s: any) => s.id !== subId) 
        } : c
      );
      
      await setDoc(docRef, {
        [serviceId]: newCategories
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/categories');
    }
  };

  const reorderSubCategories = async (serviceId: string, categoryId: string, subId: string, direction: 'up' | 'down') => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = [...(currentData[serviceId] || [])];
      const categoryIndex = currentCategories.findIndex(c => c.id === categoryId);
      if (categoryIndex === -1) return;

      const category = { ...currentCategories[categoryIndex] };
      const subs = [...(category.subCategories || [])];
      const index = subs.findIndex(s => s.id === subId);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === subs.length - 1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [subs[index], subs[targetIndex]] = [subs[targetIndex], subs[index]];

      currentCategories[categoryIndex] = { ...category, subCategories: subs };
      
      await setDoc(docRef, {
        [serviceId]: currentCategories
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/categories');
    }
  };

  const addServiceTab = async (serviceId: string, tab: Omit<ServiceTab, 'id' | 'order'>) => {
    try {
      const docRef = doc(db, 'settings', 'serviceTabs');
      const snapshot = await getDoc(docRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const currentTabs = currentData[serviceId] || [];
      
      const newTab: ServiceTab = {
        ...tab,
        id: Math.random().toString(36).substr(2, 9),
        order: currentTabs.length,
      };
      
      await setDoc(docRef, {
        [serviceId]: [...currentTabs, newTab]
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/serviceTabs');
    }
  };

  const updateServiceTab = async (serviceId: string, tabId: string, updates: Partial<ServiceTab>) => {
    try {
      const docRef = doc(db, 'settings', 'serviceTabs');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentTabs = currentData[serviceId] || [];
      const newTabs = currentTabs.map((t: any) => t.id === tabId ? { ...t, ...updates } : t);
      
      await setDoc(docRef, {
        [serviceId]: newTabs
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/serviceTabs');
    }
  };

  const deleteServiceTab = async (serviceId: string, tabId: string) => {
    try {
      const docRef = doc(db, 'settings', 'serviceTabs');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentTabs = currentData[serviceId] || [];
      const newTabs = currentTabs.filter((t: any) => t.id !== tabId);
      
      await setDoc(docRef, {
        [serviceId]: newTabs
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/serviceTabs');
    }
  };

  const reorderServiceTabs = async (serviceId: string, tabId: string, direction: 'up' | 'down') => {
    try {
      const docRef = doc(db, 'settings', 'serviceTabs');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentTabs = [...(currentData[serviceId] || [])];
      const index = currentTabs.findIndex(t => t.id === tabId);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === currentTabs.length - 1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentTabs[index], currentTabs[targetIndex]] = [currentTabs[targetIndex], currentTabs[index]];
      
      const orderedTabs = currentTabs.map((t, i) => ({ ...t, order: i }));
      await setDoc(docRef, {
        [serviceId]: orderedTabs
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/serviceTabs');
    }
  };

  const addDeliveryCategory = async (category: Omit<DeliveryCategory, 'id' | 'order'>) => {
    try {
      const docRef = doc(db, 'settings', 'delivery');
      const snapshot = await getDoc(docRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const currentCategories = currentData.categories || [];
      
      const newCategory: DeliveryCategory = {
        ...category,
        id: Math.random().toString(36).substr(2, 9),
        order: currentCategories.length,
      };
      
      await setDoc(docRef, { 
        categories: [...currentCategories, newCategory] 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/delivery');
    }
  };

  const updateDeliveryCategory = async (id: string, updates: Partial<DeliveryCategory>) => {
    try {
      const docRef = doc(db, 'settings', 'delivery');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = currentData.categories || [];
      const newCategories = currentCategories.map((c: any) => c.id === id ? { ...c, ...updates } : c);
      
      await setDoc(docRef, { categories: newCategories }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/delivery');
    }
  };

  const deleteDeliveryCategory = async (id: string) => {
    try {
      const docRef = doc(db, 'settings', 'delivery');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = currentData.categories || [];
      const newCategories = currentCategories.filter((c: any) => c.id !== id);
      
      await setDoc(docRef, { categories: newCategories }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/delivery');
    }
  };

  const reorderDeliveryCategories = async (id: string, direction: 'up' | 'down') => {
    try {
      const docRef = doc(db, 'settings', 'delivery');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentCategories = [...(currentData.categories || [])];
      const index = currentCategories.findIndex((c: any) => c.id === id);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === currentCategories.length - 1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentCategories[index], currentCategories[targetIndex]] = [currentCategories[targetIndex], currentCategories[index]];
      
      const ordered = currentCategories.map((c: any, i: number) => ({ ...c, order: i }));
      await setDoc(docRef, { categories: ordered }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/delivery');
    }
  };

  const addDeliveryVehicle = async (vehicle: Omit<DeliveryVehicle, 'id' | 'order'>) => {
    try {
      const docRef = doc(db, 'settings', 'delivery');
      const snapshot = await getDoc(docRef);
      const currentData = snapshot.exists() ? snapshot.data() : {};
      const currentVehicles = currentData.vehicles || [];
      
      const newVehicle: DeliveryVehicle = {
        ...vehicle,
        id: Math.random().toString(36).substr(2, 9),
        order: currentVehicles.length,
      };
      
      await setDoc(docRef, { 
        vehicles: [...currentVehicles, newVehicle] 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/delivery');
    }
  };

  const updateDeliveryVehicle = async (id: string, updates: Partial<DeliveryVehicle>) => {
    try {
      const docRef = doc(db, 'settings', 'delivery');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentVehicles = currentData.vehicles || [];
      const newVehicles = currentVehicles.map((v: any) => v.id === id ? { ...v, ...updates } : v);
      
      await setDoc(docRef, { vehicles: newVehicles }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/delivery');
    }
  };

  const deleteDeliveryVehicle = async (id: string) => {
    try {
      const docRef = doc(db, 'settings', 'delivery');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentVehicles = currentData.vehicles || [];
      const newVehicles = currentVehicles.filter((v: any) => v.id !== id);
      
      await setDoc(docRef, { vehicles: newVehicles }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/delivery');
    }
  };

  const reorderDeliveryVehicles = async (id: string, direction: 'up' | 'down') => {
    try {
      const docRef = doc(db, 'settings', 'delivery');
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      
      const currentData = snapshot.data();
      const currentVehicles = [...(currentData.vehicles || [])];
      const index = currentVehicles.findIndex((v: any) => v.id === id);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === currentVehicles.length - 1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [currentVehicles[index], currentVehicles[targetIndex]] = [currentVehicles[targetIndex], currentVehicles[index]];
      
      const ordered = currentVehicles.map((v: any, i: number) => ({ ...v, order: i }));
      await setDoc(docRef, { vehicles: ordered }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/delivery');
    }
  };

  const resetToDefaults = async () => {
    try {
      await setDoc(doc(db, 'settings', 'appStructure'), defaultStructure);
      await setDoc(doc(db, 'settings', 'categories'), defaultCategories);
      await setDoc(doc(db, 'settings', 'serviceTabs'), defaultServiceTabs);
      await setDoc(doc(db, 'settings', 'delivery'), { categories: defaultDeliveryCategories, vehicles: defaultDeliveryVehicles });
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/reset');
    }
  };

  const resetServiceToDefaults = async (serviceId: string) => {
    try {
      if (defaultStructure[serviceId]) {
        await setDoc(doc(db, 'settings', 'appStructure'), { [serviceId]: defaultStructure[serviceId] }, { merge: true });
      }
      if (defaultCategories[serviceId]) {
        await setDoc(doc(db, 'settings', 'categories'), { [serviceId]: defaultCategories[serviceId] }, { merge: true });
      }
      if (defaultServiceTabs[serviceId]) {
        await setDoc(doc(db, 'settings', 'serviceTabs'), { [serviceId]: defaultServiceTabs[serviceId] }, { merge: true });
      }
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/reset/${serviceId}`);
    }
  };

  const contextValue = useMemo(() => ({
    services,
    appStructure,
    categories,
    serviceTabs,
    deliveryCategories,
    deliveryVehicles,
    addService,
    updateService,
    deleteService,
    reorderServices,
    updateAppStructure,
    addSection,
    deleteSection,
    updateSection,
    reorderSections,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    reorderSubCategories,
    addServiceTab,
    updateServiceTab,
    deleteServiceTab,
    reorderServiceTabs,
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
  }), [
    services, appStructure, categories, serviceTabs, deliveryCategories, deliveryVehicles,
    addService, updateService, deleteService, reorderServices, updateAppStructure,
    addSection, deleteSection, updateSection, reorderSections, addCategory,
    updateCategory, deleteCategory, reorderCategories, addSubCategory,
    updateSubCategory, deleteSubCategory, reorderSubCategories, addServiceTab,
    updateServiceTab, deleteServiceTab, reorderServiceTabs, addDeliveryCategory,
    updateDeliveryCategory, deleteDeliveryCategory, reorderDeliveryCategories,
    addDeliveryVehicle, updateDeliveryVehicle, deleteDeliveryVehicle,
    reorderDeliveryVehicles, resetToDefaults, resetServiceToDefaults
  ]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
