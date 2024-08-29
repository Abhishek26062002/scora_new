import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';
import "./Analytics.css";

const Analytics = () => {
  useEffect(() => {
    var options = {
      chart: {
        height: 350,
        type: 'radialBar',
      },
      series: [20],
      plotOptions: {
        radialBar: {
          hollow: {
            size: '70%', // Adjust size to increase or decrease the width of the gradient bar
          },
          track: {
            background: '#e7e7e7',
            strokeWidth: '100%',
            margin: 0, // Margin between track and bar
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              blur: 4,
              opacity: 0.15
            }
          },
          stroke: {
            lineCap: 'round' // Ensures the radial bar ends are rounded
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal', // Horizontal gradient
          gradientToColors: ['#3343be'], // Gradient end color
          stops: [0, 100]
        }
      },
      colors: ['#181f58'], // Gradient start color
      labels: ['Progress'],
    };

    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();

    // Cleanup on unmount
    return () => {
      chart.destroy();
    };
  }, []);

  return (
    <div className='box'>
      <br />
      <br />
      <div id="chart"></div>
      <p className='progress-para'>You&nbsp;  can&nbsp;  see&nbsp;  your <br /> progress here...</p>
    </div>
  );
}

export default Analytics;
