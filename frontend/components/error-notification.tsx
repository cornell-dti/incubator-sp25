import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, AlertCircle, CheckCircle } from "lucide-react";
import { ReactNode } from "react";

type NotificationType = 'error' | 'warning' | 'info' | 'success';

interface ErrorNotificationProps {
  type: NotificationType;
  message: string;
  onDismiss?: () => void;
}

const iconMap: Record<NotificationType, ReactNode> = {
  error: <XCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
  info: <AlertCircle className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle className="h-4 w-4 text-green-500" />
};

const titleMap: Record<NotificationType, string> = {
  error: "Error",
  warning: "Warning",
  info: "Information",
  success: "Success"
};

const bgColorMap: Record<NotificationType, string> = {
  error: "bg-red-50",
  warning: "bg-amber-50",
  info: "bg-blue-50",
  success: "bg-green-50"
};

export function ErrorNotification({ type, message, onDismiss }: ErrorNotificationProps): React.ReactElement | null {
  if (!message) return null;

  // Use type assertion with fallback for type safety
  const safeType: NotificationType = (type as NotificationType) || 'error';

  return (
    <Alert className={`mb-4 ${bgColorMap[safeType]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {iconMap[safeType]}
        </div>
        <div className="ml-3 w-full">
          <div className="flex justify-between">
            <AlertTitle className="text-sm font-semibold">
              {titleMap[safeType]}
            </AlertTitle>
            {onDismiss && (
              <button 
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Dismiss</span>
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}