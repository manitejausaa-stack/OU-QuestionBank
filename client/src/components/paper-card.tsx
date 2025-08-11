import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PaperCardProps {
  paper: {
    id: string;
    title: string;
    course: string;
    semester: string;
    academicYear: string;
    subject: string;
    department: string;
    downloadCount: number;
    createdAt: string;
  };
}

const courseLabels: Record<string, string> = {
  btech: "B.Tech",
  mtech: "M.Tech",
  bca: "BCA",
  mca: "MCA",
  bba: "BBA",
  mba: "MBA",
};

export default function PaperCard({ paper }: PaperCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadMutation = useMutation({
    mutationFn: async (paperId: string) => {
      const response = await fetch(`/api/papers/${paperId}/download`);
      if (!response.ok) throw new Error("Failed to download paper");
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = paper.title + ".pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "The question paper is being downloaded.",
      });
      // Invalidate papers query to update download count
      queryClient.invalidateQueries({ queryKey: ["/api/papers"] });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: "Failed to download the question paper. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-lg font-heading font-semibold text-academic-dark mb-1 line-clamp-2">
              {paper.subject}
            </h4>
            <p className="text-sm text-academic-medium">
              {courseLabels[paper.course] || paper.course} • Semester {paper.semester} • {paper.academicYear}
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
            PDF
          </Badge>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-academic-medium mb-2">{paper.department}</p>
          <p className="text-xs text-gray-500">
            Uploaded: {formatDate(paper.createdAt)} • Downloads: {paper.downloadCount}
          </p>
        </div>
        
        <Button
          onClick={() => downloadMutation.mutate(paper.id)}
          disabled={downloadMutation.isPending}
          className="w-full bg-academic-blue text-white hover:bg-blue-700"
        >
          <Download className="mr-2" size={16} />
          {downloadMutation.isPending ? "Downloading..." : "Download Paper"}
        </Button>
      </CardContent>
    </Card>
  );
}
