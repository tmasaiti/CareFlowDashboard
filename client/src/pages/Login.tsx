import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { username });
    // todo: remove mock functionality
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-chart-2/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
              <ClipboardList className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">ProjectFrost</CardTitle>
            <CardDescription className="text-base mt-2">
              Care Management Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-login">
              Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo: Use any credentials to login
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
