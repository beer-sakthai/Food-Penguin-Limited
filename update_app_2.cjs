const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add EnergyTab import
c = c.replace(/import PlanningTab from '\.\/components\/PlanningTab';/, "import PlanningTab from './components/PlanningTab';\import EnergyTab from './components/EnergyTab';");

// 2. Add Zap to lucide-react
c = c.replace(/import \{\n  LayoutDashboard, Camera, Menu, X,\n  Coins,/, "import {\n  LayoutDashboard, Camera, Menu, X,\n  Coins,\n  Zap,");

// 3. Update rolePermissions
c = c.replace(/Admin: \['Overview', 'Sell', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Studio'\],/, "Admin: ['Overview', 'Sell', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Energy', 'Studio'],");
c = c.replace(/Manager: \['Overview', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Studio'\],/, "Manager: ['Overview', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Energy', 'Studio'],");
c = c.replace(/Staff: \['Overview', 'Sell', 'Production', 'Waste'\]/, "Staff: ['Overview', 'Sell', 'Production', 'Energy', 'Waste']");

// 4. Update allTabMeta
c = c.replace(/\{ id: 'Planning', label: 'Planning', icon: <Boxes className="w-4 h-4" \/> \}/, "{ id: 'Planning', label: 'Planning', icon: <Boxes className=\"w-4 h-4\" /> },\n    { id: 'Energy', label: 'Energy', icon: <Zap className=\"w-4 h-4\" /> }");

// 5. Update renderActiveView
const energyCase = `      case 'Energy':
        return <EnergyTab theme={theme} weeklyLogs={weeklyLogs} />;
      default:
        return <OverviewTab`;
c = c.replace(/default:\n        return <OverviewTab/, energyCase);

fs.writeFileSync('src/App.tsx', c);
