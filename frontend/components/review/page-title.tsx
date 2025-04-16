interface PageTitleProps {
    courseCode?: string;
  }
  
  const PageTitle: React.FC<PageTitleProps> = ({ courseCode }) => {
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Review Syllabus: {courseCode || "Unknown Course"}
        </h1>
        <p className="text-muted-foreground">
          Review and edit the extracted information from your syllabus
        </p>
      </div>
    );
  };
  
  export default PageTitle;