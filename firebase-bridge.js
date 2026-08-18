// firebase-bridge.js - النسخة الصح النهائية
import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let isSyncingFromCloud = false;

// 1. تسجيل دخول تلقائي لو مفيش يوزر (عشان مشروعك يشتغل من غير صفحة تسجيل)
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    try {
      await signInAnonymously(auth);
      return; // هيعمل trigger تاني بعد ما يسجل
    } catch (e) {
      console.error("فشل تسجيل الدخول المجهول:", e);
      return;
    }
  }

  // 2. أول ما يفتح، اسحب الداتا من فايربيز
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      isSyncingFromCloud = true; // عشان منرجعش نحفظها تاني وتعمل loop
      for (let key in data) {
        // احفظها في اللوكال عشان ملفاتك القديمة تقراها
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
      isSyncingFromCloud = false;
      console.log("تم سحب الداتا من فايربيز:", data);
      // لو عايز الصفحة تعمل تحديث تلقائي للبيانات فك الكومنت اللي تحت
      // location.reload(); 
    }
  } catch (e) {
    console.error("خطأ في سحب الداتا:", e);
  }
});

// 3. أي حاجة تتحفظ في اللوكال، احفظها في فايربيز كمان
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  
  // لو احنا بنسحب من الكلاود متعملش حفظ تاني
  if (isSyncingFromCloud) return;
  if (!auth.currentUser) return;
  if (!value) return;

  try {
    // حاول تفسر القيمة كـ JSON، لو فشلت احفظها كنص عادي
    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = value;
    }

    const ref = doc(db, "users", auth.currentUser.uid);
    const obj = {};
    obj[key] = parsedValue;
    
    // merge: true يعني ضيف الحقل ده بس ومتحذفش الباقي
    setDoc(ref, obj, { merge: true }).catch(err => console.error("خطأ حفظ:", err));

  } catch (e) {
    console.error("خطأ في firebase-bridge:", e);
  }
};

console.log("Firebase Bridge شغال ✓");
