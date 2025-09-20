import React, { useEffect, useState } from "react";
import { Box, Card, useTheme } from "@mui/material";
import ApexCharts from "apexcharts";

interface ExtendedApexCharts extends ApexCharts {
  w: {
    globals: {
      series: any[][];
    };
  };
}

const LiveChart = () => {
  const theme = useTheme();
  const [chart, setChart] = useState<ExtendedApexCharts | null>(null);

  useEffect(() => {
    if (!chart) {
      const initialData = [
        {
          x: new Date().getTime(),
          y: Math.floor(Math.random() * (90 - 10 + 1)) + 10,
        },
      ];

      const XAXISRANGE = 60 * 1000;

      const options = {
        series: [{ data: initialData }],
        chart: {
          id: "realtime",
          height: 350,
          type: "line",
          animations: {
            enabled: true,
            dynamicAnimation: { speed: 1000 },
          },
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth" },
        title: { text: "Live Updating Chart", align: "left" },
        markers: { size: 0 },
        xaxis: { type: "datetime", range: XAXISRANGE },
        yaxis: { max: 100 },
        legend: { show: false },
      };

      const newChart = new ApexCharts(document.querySelector("#live-chart"), options) as ExtendedApexCharts;
      newChart.render();
      setChart(newChart);

      const getNewSeries = (baseDate: number, range: { min: number; max: number }) => ({
        x: baseDate + 1000,
        y: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
      });

      const updateChartSeries = () => {
        if (!newChart) return;

        try {
          const lastDate = newChart.w.globals.series[0].at(-1)?.x || new Date().getTime();
          const newData = getNewSeries(lastDate, { min: 10, max: 90 });
          newChart.updateSeries([{ data: [...(newChart.w.globals.series[0] || []), newData] }]);
        } catch (error) {
          console.error("Error updating chart:", error);
        }
      };

      const intervalId = setInterval(updateChartSeries, 1000);

      return () => clearInterval(intervalId);
    }
  }, [chart]);

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
        <div id="live-chart" />
      </Box>
    </Card>
  );
};

export default LiveChart;