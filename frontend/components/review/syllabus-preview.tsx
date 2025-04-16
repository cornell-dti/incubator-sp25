import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SyllabusPreviewProps {
  content?: string;
}

const SyllabusPreview: React.FC<SyllabusPreviewProps> = ({ content }) => {
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Syllabus Preview</h2>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="h-[70vh] overflow-y-auto border rounded-md p-4 bg-muted/30 font-mono text-sm whitespace-pre-wrap">
          {content || "No content available"}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyllabusPreview;