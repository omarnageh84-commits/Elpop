// firebase-bridge.js
import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// اول ما الصفحة تفتح، اسحب الداتا من فايربيز وحطها مكان اللوكال
auth.onAuthStateChanged(async (user) => {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    // رجع الداتا للـ localStorage عشان ملفاتك القديمة تقراها عادي
    const data = snap.data();
    for (let key in data) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
    location.reload(); // اعمل ريفريش عشان التبويبات تقرا الداتا الجديدة
  }
});

// اي حاجة تتحفظ في اللوكال، احفظها في فايربيز كمان
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  if (auth.currentUser) {
    const ref = doc(db, "users", auth.currentUser.uid);
    setDoc(ref, { [key]: JSON.parse(value) }, { merge: true });
  }
};
