const fs = require('fs');
let c = fs.readFileSync('src/components/OverviewTab.tsx', 'utf8');

const startIdx = c.indexOf('// Derived Performance comparison list');
const endString = '}, [rawBranchList, vsAverageMode, selectedBranch]);';
const endIdx = c.indexOf(endString, startIdx) + endString.length;

if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
  const prefix = c.substring(0, startIdx);
  const suffix = c.substring(endIdx);
  
  const replacement = `// Derived Performance comparison list (can be all branches or selected vs company average)
  const branchPerformanceData = React.useMemo(() => {
    if (compareMode === 'all') {
      return rawBranchList;
    }
    
    if (compareMode === 'twoBranches') {
      const bA = rawBranchList.find(b => b.id === compareBranchA) || rawBranchList[0];
      const bB = rawBranchList.find(b => b.id === compareBranchB) || rawBranchList[1];
      return [bA, bB];
    }
    
    return rawBranchList;
  }, [rawBranchList, compareMode, selectedBranch, compareBranchA, compareBranchB]);`;
  
  c = prefix + replacement + suffix;
  fs.writeFileSync('src/components/OverviewTab.tsx', c);
  console.log("Replaced via index");
} else {
  console.log("No match index");
}
