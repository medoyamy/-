import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  PhoneAuthProvider, 
  browserLocalPersistence, 
  setPersistence 
} from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { safeStringify } from './lib/mapUtils';
import firebaseConfig from '../firebase-applet-config.json';

// 1. تعريف أنواع العمليات (مهمة جداً عشان الصفحات التانية متضربش)
export enum OperationType {
  CREATE = 'create', 
  UPDATE = 'update', 
  DELETE = 'delete', 
  LIST = 'list', 
  GET = 'get', 
  WRITE = 'write'
}

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// تهيئة Firestore مع دعم قواعد البيانات المسماة وإعدادات الاتصال
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

console.log("Initializing Firestore with Database ID:", databaseId);

// استخدام initializeFirestore بدلاً من getFirestore لتمرير إعدادات إضافية
export const db = initializeFirestore(app, {
  // إجبار استخدام Long Polling (أكثر استقراراً في بيئة AI Studio)
  experimentalForceLongPolling: true,
  // تجاهل القيم غير المعرفة لتجنب أخطاء الكتابة
  ignoreUndefinedProperties: true,
}, databaseId === '(default)' ? undefined : databaseId);

console.log("✅ Firestore initialized successfully");

// إعدادات اللغة والاستمرارية (عشان اليوزر ميسجلش دخول كل شوية)
auth.languageCode = 'ar';
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn("Auth persistence failed:", err);
});

// 3. طرق تسجيل الدخول
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const phoneProvider = new PhoneAuthProvider(auth);

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// 4. دالة معالجة أخطاء قاعدة البيانات (عشان الـ AI Studio يفتح معاك)
export function handleFirestoreError(error: any, operationType: OperationType = OperationType.GET, path: string | null = null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  const safeErrString = safeStringify(errInfo);
  console.error(`Firestore Error [${operationType}] at [${path}]:`, safeErrString);
  
  if (error?.code === 'unavailable') {
    console.warn("Firestore is currently unavailable. This might be due to a network issue or the database not being initialized.");
  }

  throw new Error(safeErrString);
}

// 5. دالة فحص الاتصال مع محاولة إعادة الاتصال
export async function testFirestoreConnection(retries = 3) {
  console.log(`Testing Firestore connection (Attempt ${4 - retries}/3)...`);
  try {
    // محاولة جلب مستند من السيرفر للتأكد من الاتصال
    await getDocFromServer(doc(db, 'test_connection', 'status'));
    console.log("✅ Connected successfully to Hagat App Firestore");
    return true;
  } catch (error: any) {
    console.warn(`Firestore Connection attempt failed: ${error.code}`);
    
    if (retries > 1) {
      console.log(`Retrying in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return testFirestoreConnection(retries - 1);
    }
    
    console.error("❌ Firestore Connection failed after multiple attempts:", {
      code: error.code,
      message: error.message
    });
    
    if (error.code === 'unavailable') {
      console.error("CRITICAL: Firestore backend is unreachable. This is often a temporary network issue in AI Studio. Please refresh the page.");
    }
    return false;
  }
}

export default app;