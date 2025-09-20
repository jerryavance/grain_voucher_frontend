import React from "react";
import { Box, Card, useTheme } from "@mui/material";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";
import { ApexOptions } from "apexcharts";

const PerformanceLine = () => {
  const theme = useTheme();

  const apexOptions: ApexOptions = {
    chart: {
      type: 'area',
      stacked: false,
      height: 350,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        autoSelected: 'zoom',
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0, // Adjust the size of the markers
      strokeColors: '#003399',  // Set marker color
      strokeWidth: 2,  // Set marker border width
      hover: {
        size: 8,  // Adjust the size of the markers on hover
      },
    },
    title: {
      text: 'Bond Yield',
      align: 'left',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.7, // Increase opacity for a more prominent line
        opacityTo: 0,// Decrease opacity towards the end
        stops: [0, 90, 100],
      },
    },
    yaxis: {
      opposite: true,
      
      title: {
        text: 'Yield',
      },
    },
    xaxis: {
      type: 'datetime',
    },
    tooltip: {
      shared: false,
    },
  };

  // Sample time-series data for x and y axes
  const sampleData = {
    series: [{
      name: 'Yield',
      data: [
        { x: new Date('2023-01-01').getTime(), y: 14.2},
        { x: new Date('2023-02-01').getTime(), y: 14.8 },
        { x: new Date('2023-03-01').getTime(), y: 15.0 },
        { x: new Date('2023-04-01').getTime(), y: 15.5 },
        { x: new Date('2023-05-01').getTime(), y: 15.6 },
        { x: new Date('2023-06-01').getTime(), y: 15.2 },
        { x: new Date('2023-07-01').getTime(), y: 15.3 },
        { x: new Date('2023-08-01').getTime(), y: 15.5 },
        { x: new Date('2023-09-01').getTime(), y: 16.0 },
        { x: new Date('2023-10-01').getTime(), y: 15.7 },
        { x: new Date('2023-11-01').getTime(), y: 16.0 },
        { x: new Date('2023-12-01').getTime(), y: 17.3 },
        { x: new Date('2024-01-01').getTime(), y: 18.1 },
        { x: new Date('2024-02-01').getTime(), y: 18.7 },
        // Add more data points as needed
      ],
    }],
  };

  return (
    <Card
      sx={{
        paddingX: 4,
        height: "100%",
        paddingBottom: "1.5rem",
        paddingTop: "calc(1.5rem + 15px)",
        [theme.breakpoints.down(425)]: { padding: "1.5rem" },
      }}
    >
    
      <Box
        sx={{
          "& .apexcharts-tooltip *": {
            fontFamily: theme.typography.fontFamily,
            fontWeight: 500,
          },
          "& .apexcharts-tooltip": {
            boxShadow: 0,
            borderRadius: 4,
            alignItems: "center",
            "& .apexcharts-tooltip-text-y-value": { color: "primary.main" },
            "& .apexcharts-tooltip.apexcharts-theme-light": {
              border: `1px solid ${theme.palette.divider}`,
            },
            "& .apexcharts-tooltip-series-group:last-child": {
              paddingBottom: 0,
            },
          },
        }}
      >
        <Chart
          height={245}
          options={apexOptions}
          series={sampleData.series}
          type="area"
        />
      </Box>
    </Card>
  );
};

export default PerformanceLine;