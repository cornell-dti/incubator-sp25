import { Calendar } from "lucide-react";

interface HeaderProps {
  syllabusId: number;
  totalSyllabi: number;
}

const Header: React.FC<HeaderProps> = ({ syllabusId, totalSyllabi }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-rose-500" />
          <span className="font-bold">SyllabusSync</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Syllabus {syllabusId} of {totalSyllabi}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;