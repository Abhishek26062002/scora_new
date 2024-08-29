import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const Correctgraph = () => {
  useEffect(() => {
    var options = {
      chart: {
        height: 350,
        type: 'radialBar',
      },
      series: [40],
      plotOptions: {
        radialBar: {
          hollow: {
            size: '50%', // Adjust size to increase or decrease the width of the gradient bar
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
          },
          dataLabels: {
            name: {
              show: false // Hide the label name
            },
            value: {
              show: false, // Show the value
              fontSize: '40px', // Increase font size
              fontFamily: 'Arial', // Adjust font family if needed
              fontWeight: 'bold', // Make it bold
              color: '#162f0f' // Text color
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal', // Horizontal gradient
          gradientToColors: ['#004d00'], // Dark green gradient end color
          stops: [0, 100]
        }
      },
      colors: ['#004d00'], // Dark green gradient start color
      labels: [''] // Hide labels
    };

    var chart = new ApexCharts(document.querySelector("#correctchart"), options);
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
      <div id="correctchart"></div>
      <p className='progress-para' style={{ color: "#162f0f" }}>Correct : 20/30</p>
    </div>
  );
}

export default Correctgraph;
