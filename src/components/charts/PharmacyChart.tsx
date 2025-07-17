
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Pill, DollarSign } from 'lucide-react';

interface PharmacyChartProps {
  type: 'sales' | 'patients' | 'inventory' | 'revenue';
  data: any[];
  title: string;
  description?: string;
}

const chartConfig = {
  sales: {
    label: "Ventes",
    color: "#22c55e",
  },
  patients: {
    label: "Patients",
    color: "#16a34a", 
  },
  inventory: {
    label: "Stock",
    color: "#15803d",
  },
  revenue: {
    label: "Revenus",
    color: "#14532d",
  }
};

export function PharmacyChart({ type, data, title, description }: PharmacyChartProps) {
  const getIcon = () => {
    switch (type) {
      case 'sales':
        return <TrendingUp className="h-5 w-5 text-pharmacy-600" />;
      case 'patients':
        return <Users className="h-5 w-5 text-pharmacy-600" />;
      case 'inventory':
        return <Pill className="h-5 w-5 text-pharmacy-600" />;
      case 'revenue':
        return <DollarSign className="h-5 w-5 text-pharmacy-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-pharmacy-600" />;
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'sales':
      case 'revenue':
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartConfig[type].color} 
                  strokeWidth={3}
                  dot={{ fill: chartConfig[type].color, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'patients':
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar 
                  dataKey="value" 
                  fill={chartConfig[type].color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'inventory':
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={chartConfig[type].color}
                  dataKey="value"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      default:
        return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Graphique non disponible</div>;
    }
  };

  return (
    <Card className="pharmacy-card border-pharmacy-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-pharmacy-800 flex items-center gap-2">
              {getIcon()}
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-pharmacy-600">{description}</p>
            )}
          </div>
          <div className="p-3 bg-pharmacy-100 rounded-xl">
            {getIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
