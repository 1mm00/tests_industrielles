import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface IndustrialChartProps {
    data?: {
        series?: any[];
        categories?: string[];
    };
}

const IndustrialChart = ({ data }: IndustrialChartProps) => {
    const series = data?.series && data.series.length > 0 ? data.series : [
        { name: "Tests Réalisés", type: "column", data: [] },
        { name: "Tests Conformes", type: "area", data: [] },
        { name: "Non-Conformités", type: "line", data: [] },
    ];

    const categories = data?.categories && data.categories.length > 0 ? data.categories : [];


    const options: ApexOptions = {
        chart: {
            stacked: false,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            background: 'transparent',
        },
        stroke: {
            width: [0, 4, 3],
            curve: "smooth",
            dashArray: [0, 0, 8]
        },
        plotOptions: {
            bar: {
                columnWidth: "30%",
                borderRadius: 10,
            },
        },
        colors: ["#2E5BFF", "#00C853", "#FFAB00"], // Cobalt, Emerald, Security Orange
        fill: {
            type: ['solid', 'gradient', 'solid'],
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        labels: categories,
        markers: {
            size: [0, 5, 0],
            strokeWidth: 3,
            hover: { size: 7 }
        },
        xaxis: {
            type: "category",
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: '#94a3b8', fontWeight: 700, fontSize: '10px' } }
        },
        yaxis: {
            labels: { style: { colors: '#94a3b8', fontWeight: 700, fontSize: '10px' } }
        },
        tooltip: {
            theme: 'dark',
            shared: true,
            intersect: false,
        },
        grid: {
            borderColor: "#f1f5f9",
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontWeight: 700,
            fontSize: '11px',
            markers: { size: 6 }
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Performance & Qualité Industrielle</h2>
                <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-200"></span>
                </div>
            </div>
            <ReactApexChart
                options={options}
                series={series}
                type="line"
                height={350}
            />
        </div>
    );
};

export default IndustrialChart;
