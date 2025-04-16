import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  syllabusId: number;
  totalSyllabi: number;
  handlePrevious: () => void;
  handleNext: () => void;
  loading: {
    saving: boolean;
  };
}

const Navigation: React.FC<NavigationProps> = ({
  syllabusId,
  totalSyllabi,
  handlePrevious,
  handleNext,
  loading,
}) => {
  return (
    <div className="mt-8 flex justify-between">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={syllabusId <= 1 || loading.saving}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <Button
        onClick={handleNext}
        className="bg-rose-500 hover:bg-rose-600"
        disabled={loading.saving}
      >
        {loading.saving ? (
          "Saving..."
        ) : syllabusId < totalSyllabi ? (
          <>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            Finish
            <Check className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default Navigation;