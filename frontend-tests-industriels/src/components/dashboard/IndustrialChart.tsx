import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface IndustrialChartProps {
    data?: {
        series?: any[];
        categories?: string[];
    };
}

const IndustrialChart = ({ data }: IndustrialChartProps) => {
    const series = data?.series || [
        {
            name: "Tests Réalisés",
            type: "column",
            data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
        },
        {
            name: "Tests Conformes",
            type: "area",
            data: [20, 10, 20, 25, 12, 18, 30, 18, 40, 20, 28, 42],
        },
        {
            name: "Non-Conformités",
            type: "line",
            data: [3, 1, 2, 2, 1, 4, 7, 3, 4, 2, 2, 3],
        },
    ];

    const categories = data?.categories || [
        "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
        "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];

    const options: ApexOptions = {
        chart: {
            stacked: false,
            toolbar: {
                show: false,
            },
            fontFamily: 'Inter, sans-serif',
        },
        stroke: {
            width: [0, 2, 4],
            curve: "smooth",
        },
        plotOptions: {
            bar: {
                columnWidth: "50%",
                borderRadius: 4,
            },
        },
        colors: ["#3b5de7", "#45cb85", "#f06292"],
        fill: {
            opacity: [0.85, 0.25, 1],
            gradient: {
                inverseColors: false,
                shade: "light",
                type: "vertical",
                opacityFrom: 0.85,
                opacityTo: 0.55,
                stops: [0, 100, 100, 100],
            },
        },
        labels: categories,
        markers: {
            size: 0,
        },
        xaxis: {
            type: "category",
        },
        yaxis: {
            title: {
                text: "Nombre d'événements",
                style: {
                    color: '#6b7280',
                    fontWeight: 500,
                }
            },
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (y) {
                    if (typeof y !== "undefined") {
                        return y.toFixed(0) + " tests/nc";
                    }
                    return y;
                },
            },
        },
        grid: {
            borderColor: "#f1f1f1",
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
        }
    };

    return (
        <div className="card h-full">
            <div className="card-header flex items-center justify-between">
                <h2 className="card-title">Performance & Qualité Industrielle</h2>
            </div>
            <div className="p-4">
                <ReactApexChart
                    options={options}
                    series={series}
                    type="line"
                    height={350}
                />
            </div>
        </div>
    );
};

export default IndustrialChart;
