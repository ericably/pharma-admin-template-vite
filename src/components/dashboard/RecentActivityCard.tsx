
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Activity {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  type: "order" | "prescription" | "inventory" | "patient";
}

interface RecentActivityCardProps {
  activities: Activity[];
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Order</Badge>;
      case "prescription":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Prescription</Badge>;
      case "inventory":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Inventory</Badge>;
      case "patient":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Patient</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{activity.title}</div>
                  {getActivityBadge(activity.type)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {activity.description}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{activity.timestamp}</span>
                </div>
                <div className="border-b border-border" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
