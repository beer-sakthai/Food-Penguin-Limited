const fs = require('fs');

function normalizeNewlines(str) {
  return str.replace(/\r\n/g, '\n');
}

// 1. Update src/components/LoginScreen.tsx
try {
  let loginContent = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');
  const simpleTarget = "min-h-screen flex items-center justify-center font-sans";
  if (loginContent.includes(simpleTarget)) {
    loginContent = loginContent.replace(simpleTarget, "h-full w-full flex items-center justify-center font-sans");
    fs.writeFileSync('src/components/LoginScreen.tsx', loginContent, 'utf8');
    console.log("Successfully updated src/components/LoginScreen.tsx");
  } else {
    console.error("Could not find min-h-screen container in LoginScreen.tsx");
  }
} catch (e) {
  console.error("Error editing LoginScreen.tsx:", e);
}

// 2. Update src/App.tsx
try {
  let appContentRaw = fs.readFileSync('src/App.tsx', 'utf8');
  let appContent = normalizeNewlines(appContentRaw);

  // Targets and Replacements
  const loginGuardTarget = `  if (!currentUser) {
    return (
      <LoginScreen
        theme={theme}
        onLogin={(username, role) => {
          const userObj = { username, role, email: "demo@foodpenguin.com" };
          localStorage.setItem("localCurrentUser", JSON.stringify(userObj));
          setCurrentUser(userObj);
          setUserRole(role as any);
        }}
      />
    );
  }`;

  const loginGuardReplacement = `  if (!currentUser) {
    return (
      <div className={\`relative w-screen h-screen overflow-hidden p-[14px] \${isLight ? "bg-zinc-100" : "bg-black"}\`}>
        {/* Versace Gold Frame Borders */}
        <div className="versace-frame-top" />
        <div className="versace-frame-bottom" />
        <div className="versace-frame-left" />
        <div className="versace-frame-right" />
        <LoginScreen
          theme={theme}
          onLogin={(username, role) => {
            const userObj = { username, role, email: "demo@foodpenguin.com" };
            localStorage.setItem("localCurrentUser", JSON.stringify(userObj));
            setCurrentUser(userObj);
            setUserRole(role as any);
          }}
        />
      </div>
    );
  }`;

  const mainWorkspaceTarget = `  return (
    <div
      id="app-workspace"
      className={\`h-screen w-screen overflow-hidden flex flex-col md:flex-row font-sans antialiased transition-colors duration-500 \${
        isLight
          ? "bg-transparent text-zinc-900"
          : "bg-transparent text-zinc-100"
      }\`}
    >`;

  const mainWorkspaceReplacement = `  return (
    <div className={\`relative w-screen h-screen overflow-hidden p-[14px] \${isLight ? "bg-zinc-100" : "bg-zinc-950"}\`}>
      {/* Versace Gold Frame Borders */}
      <div className="versace-frame-top" />
      <div className="versace-frame-bottom" />
      <div className="versace-frame-left" />
      <div className="versace-frame-right" />

      <div
        id="app-workspace"
        className={\`h-full w-full overflow-hidden flex flex-col md:flex-row font-sans antialiased transition-colors duration-500 \${
          isLight
            ? "bg-transparent text-zinc-900"
            : "bg-transparent text-zinc-100"
        }\`}
      >`;

  const closingTarget = `      )}
    </div>
  );
}`;

  const closingReplacement = `      )}
      </div>
    </div>
  );
}`;

  let successCount = 0;

  if (appContent.includes(normalizeNewlines(loginGuardTarget))) {
    appContent = appContent.replace(normalizeNewlines(loginGuardTarget), loginGuardReplacement);
    successCount++;
  } else {
    console.error("loginGuardTarget not matched!");
  }

  if (appContent.includes(normalizeNewlines(mainWorkspaceTarget))) {
    appContent = appContent.replace(normalizeNewlines(mainWorkspaceTarget), mainWorkspaceReplacement);
    successCount++;
  } else {
    console.error("mainWorkspaceTarget not matched!");
  }

  if (appContent.includes(normalizeNewlines(closingTarget))) {
    appContent = appContent.replace(normalizeNewlines(closingTarget), closingReplacement);
    successCount++;
  } else {
    console.error("closingTarget not matched!");
  }

  if (successCount === 3) {
    if (appContentRaw.includes('\\r\\n')) {
      appContent = appContent.replace(/\\n/g, '\\r\\n');
    }
    fs.writeFileSync('src/App.tsx', appContent, 'utf8');
    console.log("Successfully updated src/App.tsx with all 3 replacements!");
  } else {
    console.error(\`Only matched \${successCount}/3 of the targets in src/App.tsx. Refusing to write to file.\`);
  }
} catch (e) {
  console.error("Error editing App.tsx:", e);
}
