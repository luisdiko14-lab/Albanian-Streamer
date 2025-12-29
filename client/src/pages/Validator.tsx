import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export default function Validator() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/me"],
  });

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold">Verify Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={() => setLocation("/")}
            data-testid="button-confirm-validator"
          >
            Confirm & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
