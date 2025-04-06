import type { User } from "@/@types/models";

interface UserInfoCardProps {
  user: User;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow border mb-8">
      <p className="text-lg font-medium">{user.name}</p>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
}
