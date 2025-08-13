import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, ChartData, ChartOptions } from "chart.js";
import { useEffect, useState } from "react";


ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip);

interface UserNames {
  myname: string;
  comparerName: string;
}

interface LinneChartProps {
  myData: { [year: number]: number };
  comparerData: { [year: number]: number };
  userNames: UserNames;
}

export function LinneChart({ myData, comparerData, userNames }: LinneChartProps) {
  const [myContributions, setMyContributions] = useState<(number | null)[]>(Object.values(myData));
  const [comparerContributions, setComparerContributions] = useState<(number | null)[]>(Object.values(comparerData));
  
  const getUserYearsforLabel = (myData: { [year: number]: number }, comparerData: { [year: number]: number }): string[] => {
    const myYears = Object.keys(myData);   
    const comparerYears = Object.keys(comparerData);
    if (myYears.length > comparerYears.length) {
      return myYears;
    } else {
      return comparerYears;
    }   
  };
  
  const mainLabel = getUserYearsforLabel(myData, comparerData);
    
  useEffect(() => {
    const maxLength = Math.max(myContributions.length, comparerContributions.length);

    // Function to pad an array with null at the start
    const padArray = (arr: (number | null)[], length: number): (number | null)[] => {
      const padding = Array(length - arr.length).fill(null);
      return [...padding, ...arr];
    };

    if (myContributions.length < maxLength) {
      setMyContributions(padArray(myContributions, maxLength));
    }
    
    if (comparerContributions.length < maxLength) {
      setComparerContributions(padArray(comparerContributions, maxLength));
    }
  }, [myContributions, comparerContributions]);
 
  const LINECHART_DATA: ChartData<'line'> = {
    labels: mainLabel,
    datasets: [
      { 
        label: userNames.myname,
        data: myContributions,
        borderColor: '#63FF60',
        pointBackgroundColor: '#fff', 
        pointBorderColor: '#fff', 
        pointRadius: 5,
        borderWidth: 4
      },
      { 
        label: userNames.comparerName,
        data: comparerContributions,
        borderColor: '#FFE55B',
        pointBackgroundColor: '#fff', 
        pointBorderColor: '#fff', 
        pointRadius: 5,
        borderWidth: 4
      },
    ],
  };
  
  const options: ChartOptions<'line'> = {
    scales: {
      x: {
        grid: {
          color: '#FFFFFF33', 
        },
        ticks: {
          color: '#fff'
        }
      },
      y: {
        grid: {
          color: '#FFFFFF33', 
        },
        ticks: {
          color: '#fff'
        }
      },
    },
  };
  
  return (
    <Line options={options} data={LINECHART_DATA} />
  );
}
