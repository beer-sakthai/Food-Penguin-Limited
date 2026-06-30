const fs = require('fs');

function cleanLoginScreen() {
  const file = 'src/components/LoginScreen.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Remove imports
  content = content.replace(/import \{ signInWithPopup, GoogleAuthProvider \} from 'firebase\/auth';\n?/g, '');
  content = content.replace(/import \{ auth \} from '\.\.\/firebase';\n?/g, '');

  // Remove handleGoogleSignIn
  const handleGoogleSignInRegex = /const handleGoogleSignIn = async \(\) => \{[\s\S]*?\n  \};\n/g;
  content = content.replace(handleGoogleSignInRegex, '');

  // Remove Google Sign In UI block safely
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
  content = content.replace(/import \{ auth, db, handleFirestoreError, OperationType \} from '\.\/firebase';\n?/g, '');
  content = content.replace(/import \{ onAuthStateChanged, signOut \} from 'firebase\/auth';\n?/g, '');
  content = content.replace(/import \{ collection, onSnapshot, setDoc, doc, updateDoc, getDocs \} from 'firebase\/firestore';\n?/g, '');

  // Remove isFirebaseSynced state
  content = content.replace(/const \[isFirebaseSynced, setIsFirebaseSynced\] = useState\(false\);\n?/g, '');

  // Remove Auth Listener safely
  content = content.replace(/\/\/ Auth Listener[\s\S]*?\}, \[\]\);\n/g, '');

  // Remove Firestore Sync Listener safely
  content = content.replace(/\/\/ Firestore Sync Listener[\s\S]*?\}, \[selectedBranch, isFirebaseSynced\]\);\n/g, '');

  // Replace all if (isFirebaseSynced) blocks
  content = content.replace(/ *if \(isFirebaseSynced\) \{[\s\S]*?\}\n/g, '');
  content = content.replace(/ *if \(isFirebaseSynced\) return;\n/g, '');

  // Remove signOut
  content = content.replace(/await signOut\(auth\)\.catch\(\(\) => \{\}\);\n/g, '');

  // Remove sync status light in the UI using simple string replace
  const syncLight = "<span className={`w-2 h-2 rounded-full ${isFirebaseSynced ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'} absolute -bottom-0.5 -right-0.5 border ${isLight ? 'border-zinc-100' : 'border-zinc-950'}`} />";
  content = content.replace(syncLight, '');

  fs.writeFileSync(file, content, 'utf8');
}

try {
    cleanLoginScreen();
    cleanAppTsx();
    console.log('Firebase logic stripped successfully.');
} catch (e) {
    console.error('Error stripping Firebase logic:', e);
}
