import type { User } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserPlus } from "lucide-react";

interface UserCardProps {
  user: User;
  commonTags?: number;
}

export const UserCard = ({ user, commonTags }: UserCardProps) => {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
          {user.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{user.name}</h3>
            {commonTags !== undefined && commonTags > 0 && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {commonTags} chung
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{user.occupation}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {user.interests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="outline" className="text-[10px] py-0">
                {interest}
              </Badge>
            ))}
            {user.interests.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{user.interests.length - 3}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
          <UserPlus className="w-3 h-3 mr-1" /> Kết bạn
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2">
          <MessageCircle className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
