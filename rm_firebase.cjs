const fs = require('fs');

function cleanLoginScreen() {
  const file = 'src/components/LoginScreen.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Remove imports
  content = content.replace(/import { signInWithPopup, GoogleAuthProvider } from 'firebase\/auth';\n?/g, '');
  content = content.replace(/import { auth } from '\.\.\/firebase';\n?/g, '');

  // Remove handleGoogleSignIn
  const handleGoogleSignInRegex = /const handleGoogleSignIn = async \(\) => \{[\s\S]*?\n  \};\n/g;
  content = content.replace(handleGoogleSignInRegex, '');

  // Remove Google Sign In UI block
  const googleUIRegex = /<\!isRegistering && \(\s*<>\s*<div className="relative my-5 flex py-1 items-center">[\s\S]*?<\/button>\s*<\/>\s*\)\}/g;
  content = content.replace(googleUIRegex, '');

  // Fallback: manually strip the Corporate Auth chunk if regex missed due to escaping
  const fallbackStart = "{!isRegistering && (";
  const fallbackEnd = "</button>\n          </>\n        )}";
  if (content.includes("Or Corporate Auth")) {
      let startIndex = content.indexOf("{!isRegistering && (\n          <>\n            <div className=\"relative my-5");
      let endIndex = content.indexOf("          </>\n        )}", startIndex);
      if (startIndex !== -1 && endIndex !== -1) {
          content = content.substring(0, startIndex) + content.substring(endIndex + 25);
      }
  }

  fs.writeFileSync(file, content, 'utf8');
}

function cleanAppTsx() {
  const file = 'src/App.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Remove imports
  content = content.replace(/import { auth, db, handleFirestoreError, OperationType } from '\.\/firebase';\n?/g, '');
  content = content.replace(/import { onAuthStateChanged, signOut } from 'firebase\/auth';\n?/g, '');
  content = content.replace(/import { collection, onSnapshot, setDoc, doc, updateDoc, getDocs } from 'firebase\/firestore';\n?/g, '');

  // Remove isFirebaseSynced state and listener
  content = content.replace(/const \[isFirebaseSynced, setIsFirebaseSynced\] = useState\(false\);\n?/g, '');
  
  const firestoreListenerStart = content.indexOf("// Firestore Sync Listener");
  if (firestoreListenerStart !== -1) {
    const firestoreListenerEnd = content.indexOf("}, [selectedBranch, isFirebaseSynced]);") + 39;
    content = content.substring(0, firestoreListenerStart) + content.substring(firestoreListenerEnd);
  }

  // Remove auth listener
  const authListenerStart = content.indexOf("const unsubscribe = onAuthStateChanged(auth, (user) => {");
  if (authListenerStart !== -1) {
    const authListenerEnd = content.indexOf("return () => unsubscribe();\n  }, []);") + 38;
    content = content.substring(0, authListenerStart) + content.substring(authListenerEnd);
  }

  // Replace all if (isFirebaseSynced) { ... } blocks
  // Since some blocks have 1 statement, some have more, we can use regex
  // Actually, string replace with known patterns:
  content = content.replace(/if \(isFirebaseSynced\) \{[\s\S]*?\}\n/g, '');
  content = content.replace(/if \(isFirebaseSynced\) return;\n/g, '');

  // Remove signOut
  content = content.replace(/await signOut\(auth\)\.catch\(\(\) => \{\}\);\n/g, '');

  // Remove sync status light in the UI (the little pulsing dot next to username)
  content = content.replace(/<span className={`w-2 h-2 rounded-full \${isFirebaseSynced \? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'} absolute -bottom-0\.5 -right-0\.5 border \${isLight \? 'border-zinc-100' : 'border-zinc-950'}`} \/>/g, '');

  fs.writeFileSync(file, content, 'utf8');
}

cleanLoginScreen();
cleanAppTsx();
console.log('Firebase logic stripped successfully.');
