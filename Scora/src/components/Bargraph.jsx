import React, { useEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const Bargraph = () => {
  const chartDivRef = useRef(null);

  useEffect(() => {
    // Create root element
    var root = am5.Root.new(chartDivRef.current);

    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart
    var chart = root.container.children.push(am5percent.PieChart.new(root, {
      startAngle: 180,
      endAngle: 360,
      layout: root.verticalLayout,
      innerRadius: am5.percent(50)
    }));

    // Create series
    var series = chart.series.push(am5percent.PieSeries.new(root, {
      startAngle: 180,
      endAngle: 360,
      valueField: "value",
      categoryField: "category",
      alignLabels: false
    }));

    series.states.create("hidden", {
      startAngle: 180,
      endAngle: 180
    });

    series.slices.template.setAll({
      cornerRadius: 5
    });

    series.ticks.template.setAll({
      forceHidden: true
    });

    // Set data
    series.data.setAll([
      { value: 10, category: "One" },
      { value: 9, category: "Two" },
      { value: 6, category: "Three" },
      { value: 5, category: "Four" },
      { value: 4, category: "Five" },
      { value: 3, category: "Six" },
      { value: 1, category: "Seven" }
    ]);

    series.appear(1000, 100);

    // Hide the canvas layer directly
    const style = document.createElement('style');
    style.textContent = '.am5-layer-30 { display: none; }';
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      style.remove();  // Remove the style when component unmounts
      root.dispose();
    };
  }, []);

  return (
    <div>
      <div id="chartdiv" ref={chartDivRef} style={{ width: "100VW", height: "500px",padding : "0px" }}></div>
    </div>
  );
};

export default Bargraph;
