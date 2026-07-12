import { jsPDF } from "jspdf";

export interface CapacityBreakdownItem {
  day: string;
  date: string;
  current: number;
  projected: number;
  initialAiForecast?: number;
}

export interface ExportCapacityPDFParams {
  dailyCapacityBreakdown: CapacityBreakdownItem[];
  sortedDailyCapacityBreakdown: CapacityBreakdownItem[];
  selectedWeekRange: string;
  bottleneckThreshold: number;
  capacitySmoothing: "raw" | "smoothed";
  capacitySortBy: "date" | "bottleneck" | "custom";
}

export function exportCapacityPDF({
  dailyCapacityBreakdown,
  sortedDailyCapacityBreakdown,
  selectedWeekRange,
  bottleneckThreshold,
  capacitySmoothing,
  capacitySortBy,
}: ExportCapacityPDFParams) {
    if (!dailyCapacityBreakdown || dailyCapacityBreakdown.length === 0) return;

    // Initialize portrait PDF (A4 size page dimensions: 210mm x 297mm)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Helper color palette following the elegant Slate & Amber UI dashboard theme
    const primaryColor = [24, 24, 27]; // Dark Slate (Zinc 900)
    const accentColor = [249, 115, 22]; // Orange 500
    const lightBg = [244, 244, 245]; // Light Gray (Zinc 100)
    const alertColor = [239, 68, 68]; // Red 500
    const amberAlert = [217, 119, 6]; // Amber 600
    const textGray = [113, 113, 122]; // Zinc 500

    // --- Page Header Background Accent Banner ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 42, "F");

    // Header Metadata & Typography branding
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("BAKERY OPERATIONAL CORE SUITE", 15, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("PREDICTIVE WEEKLY CAPACITY PROJECTION REPORT", 15, 20);

    doc.setTextColor(161, 161, 170); // Zinc 400
    doc.setFontSize(8);
    doc.text(`Active Calendar Frame: ${selectedWeekRange}`, 15, 26);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at ${new Date().toLocaleTimeString("en-US")}`,
      15,
      30,
    );

    // Dynamic watermarked badge
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(168, 10, 27, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("ANALYTICS ENGINE", 170, 13.5);

    // --- KPIs / Summary Metric Cards Banner ---
    let yPos = 52;

    const totalDays = dailyCapacityBreakdown.length;
    const avgProjected = Math.round(
      dailyCapacityBreakdown.reduce((sum, item) => sum + item.projected, 0) /
      totalDays,
    );
    const maxProjectedItem = [...dailyCapacityBreakdown].sort(
      (a, b) => b.projected - a.projected,
    )[0];
    const bottlenecksCount = dailyCapacityBreakdown.filter(
      (item) => item.projected > bottleneckThreshold,
    ).length;

    // Background container sheet for key summaries
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(15, yPos, 180, 25, 2.5, 2.5, "F");

    // KPI Box 1: Average Load
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("AVERAGE LOAD FACTOR", 22, yPos + 7);
    doc.setFontSize(14);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(`${avgProjected}%`, 22, yPos + 17);

    // KPI Box 2: Peak Loaded Day
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("PEAK CAPACITY LIMIT", 80, yPos + 7);
    doc.setFontSize(12.5);
    doc.setTextColor(39, 39, 42); // Zinc 800
    doc.text(`${maxProjectedItem.projected}% Load`, 80, yPos + 14.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`On ${maxProjectedItem.day}`, 80, yPos + 19);

    // KPI Box 3: Bottleneck Threshold Alarms
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("THRESHOLD BOTTLENECKS", 138, yPos + 7);
    doc.setFontSize(13.5);
    if (bottlenecksCount > 0) {
      doc.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
      doc.text(`${bottlenecksCount} Hot Days`, 138, yPos + 17);
    } else {
      doc.setTextColor(16, 185, 129); // Green 500
      doc.text("Stable Output (0)", 138, yPos + 17);
    }

    // --- Subtitle parameter summary line ---
    yPos += 35;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("7-DAY DAILY PREDICTED TIMELINE BREAKDOWN", 15, yPos);

    // Thin grey spacer boundary line
    doc.setDrawColor(228, 228, 231); // Zinc 200
    doc.setLineWidth(0.35);
    doc.line(15, yPos + 2, 195, yPos + 2);

    // Print metadata variables
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`Bottleneck Limit Trigger: ${bottleneckThreshold}%`, 15, yPos);
    doc.text(
      `Smoothing Mode: ${capacitySmoothing === "smoothed" ? "3-Day Rolling Moving Average" : "Raw Metrics (None)"}`,
      72,
      yPos,
    );
    doc.text(
      `Sequence Filter Order: ${capacitySortBy === "bottleneck" ? "Bottleneck Intensity" : capacitySortBy === "custom" ? "Custom Priority" : "Calendar Sequence"}`,
      142,
      yPos,
    );

    // --- Main Capacity Breakdown Table ---
    yPos += 6;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPos, 180, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("WEEKDAY", 20, yPos + 5.5);
    doc.text("DATE", 50, yPos + 5.5);
    doc.text("BASE CURRENT (%)", 85, yPos + 5.5);
    doc.text("PROJECTED LOAD (%)", 125, yPos + 5.5);
    doc.text("BOTTLENECK STATE", 165, yPos + 5.5);

    const rowHeight = 9.5;
    yPos += 8;

    sortedDailyCapacityBreakdown.forEach((item, idx) => {
      const isBottleneck = item.projected > bottleneckThreshold;

      // Alternating row highlighting background
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPos, 180, rowHeight, "F");
      }

      // Draw light wire separators
      doc.setDrawColor(244, 244, 245);
      doc.setLineWidth(0.2);
      doc.line(15, yPos + rowHeight, 195, yPos + rowHeight);

      // Value rendering block
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(item.day, 20, yPos + 6);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(82, 82, 91);
      doc.text(item.date, 50, yPos + 6);

      doc.text(`${item.current}%`, 85, yPos + 6);

      // Project highlighting styling
      doc.setFont("helvetica", "bold");
      if (isBottleneck) {
        doc.setTextColor(amberAlert[0], amberAlert[1], amberAlert[2]);
        doc.text(`${item.projected}%`, 125, yPos + 6);
      } else {
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${item.projected}%`, 125, yPos + 6);
      }

      // Alert cell tag
      if (isBottleneck) {
        doc.setFillColor(254, 243, 199); // Amber 100
        doc.roundedRect(162, yPos + 1.8, 28, 5.5, 0.8, 0.8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(180, 83, 9); // Amber 700
        doc.text("BOTTLENECK", 165.5, yPos + 5.6);
      } else {
        doc.setTextColor(113, 113, 122);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text("NORMAL LOAD", 165, yPos + 5.6);
      }

      yPos += rowHeight;
    });

    // --- Footer Explanatory Bullet Points & Notes ---
    yPos += 10;
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("EXECUTIVE INTERPRETATION GUIDELINE", 15, yPos);

    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.35);
    doc.line(15, yPos + 2, 195, yPos + 2);

    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(82, 82, 91);

    const bulletins = [
      "- Capacity forecasts are computed dynamically based on the active rolling index of completed production batches versus target.",
      '- Days highlighted with yellow "BOTTLENECK" alert badges exceed your configured threshold parameter limit.',
      "- Moving average view reduces short-term variation spikes to reveal systemic weekly production limits for senior management reporting.",
      "- Report intended for staff duty scheduling, shifts optimization, and oven heating resource conservation.",
    ];

    bulletins.forEach((bullet) => {
      doc.text(bullet, 15, yPos);
      yPos += 4.5;
    });

    // Ground footer copyright boundary lines
    yPos = 282;
    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.3);
    doc.line(15, yPos - 3, 195, yPos - 3);

    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFontSize(7);
    doc.text(
      "Automated forecast projection report. Confidential & intended for Bakery Internal Operations.",
      15,
      yPos,
    );
    doc.text("Page 1 of 1", 182, yPos);

    // Trigger PDF browser-side download
    doc.save(
      `Capacity_Projection_Report_${selectedWeekRange.replace(/\s+/g, "_")}.pdf`,
    );
}
