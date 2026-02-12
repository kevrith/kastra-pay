import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>
            Manage payment provider settings, fees, and platform behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ShieldCheck className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Admin Settings</p>
            <p className="text-sm">
              Platform configuration, fee management, and provider settings
              will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
