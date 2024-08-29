import React, { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const FullGraph = () => {
  useLayoutEffect(() => {
    // Create root element
    const root = am5.Root.new("chartdiv");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        endAngle: 270,
        layout: root.verticalLayout,
        innerRadius: am5.percent(60),
      })
    );

    // Create series
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        endAngle: 270,
      })
    );

    // Set colors
    series.set(
      "colors",
      am5.ColorSet.new(root, {
        colors: [
          am5.color(0x00ff00), // Green for Correct
          am5.color(0xff0000), // Red for Wrong
          am5.color(0x808080), // Grey for Unattempted
          am5.color(0x0000ff), // Blue for Attempted
        ],
      })
    );

    // Set slice template
    series.slices.template.setAll({
      strokeWidth: 2,
      stroke: am5.color(0xffffff),
      cornerRadius: 10,
      shadowOpacity: 0.1,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowColor: am5.color(0x000000),
    });

    // Add hover state
    series.slices.template.states.create("hover", {
      shadowOpacity: 1,
      shadowBlur: 10,
    });

    // Hide labels
    series.labels.template.setAll({
      visible: false,
    });

    // Hide ticks
    series.ticks.template.setAll({
      visible: false,
    });

    // Create hidden state
    series.states.create("hidden", {
      endAngle: -90,
    });

    // Set data (four elements)
    series.data.setAll([
      { category: "Correct", value: 50 },
      { category: "Wrong", value: 20 },
      { category: "Unattempted", value: 10 }
    ]);

    // Create legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15,
      })
    );

    legend.markerRectangles.template.adapters.add("fillGradient", function () {
      return undefined;
    });

    legend.data.setAll(series.dataItems);

    // Animate series
    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, []);

  return <div id="chartdiv" style={{ width: "auto", height: "350px" }}></div>;
};

export default FullGraph;
