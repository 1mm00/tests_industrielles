import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface NcDistributionChartProps {
    data?: {
        series?: number[];
    };
}

const NcDistributionChart = ({ data }: NcDistributionChartProps) => {
    const series = data?.series || [44, 55, 13, 33];

    const options: ApexOptions = {
        labels: ["Mineure", "Moyenne", "Majeure", "Critique"],
        colors: ["#45cb85", "#3b5de7", "#eeb902", "#f06292"],
        legend: {
            show: true,
            position: "bottom",
            fontFamily: 'Inter, sans-serif',
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total NC',
                            formatter: () => series.reduce((a, b) => a + b, 0).toString()
                        }
                    }
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: false
        }
    };

    const total = series.reduce((a, b) => a + b, 0);
    const percentages = series.map(v => Math.round((v / total) * 100));

    return (
        <div className="card h-full">
            <div className="card-header">
                <h2 className="card-title">Distribution des NC</h2>
            </div>
            <div className="p-4">
                <ReactApexChart
                    options={options}
                    series={series}
                    type="donut"
                    height={280}
                />
                <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#45cb85]"></span>
                            Mineure
                        </p>
                        <h5 className="text-lg font-bold">{percentages[0]}%</h5>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#3b5de7]"></span>
                            Moyenne
                        </p>
                        <h5 className="text-lg font-bold">{percentages[1]}%</h5>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#eeb902]"></span>
                            Majeure
                        </p>
                        <h5 className="text-lg font-bold">{percentages[2]}%</h5>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#f06292]"></span>
                            Critique
                        </p>
                        <h5 className="text-lg font-bold">{percentages[3]}%</h5>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NcDistributionChart;
