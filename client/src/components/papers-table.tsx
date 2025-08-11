import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Download, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const courses = [
  { value: "all", label: "All Courses" },
  { value: "bsc", label: "BSC" },
  { value: "bcom", label: "BCOM" },
  { value: "bba", label: "BBA" },
  { value: "ba", label: "BA" },
];

const courseLabels: Record<string, string> = {
  bsc: "BSC",
  bcom: "BCOM",
  bba: "BBA",
  ba: "BA",
};

export default function PapersTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: papersData, isLoading } = useQuery({
    queryKey: ["/api/admin/papers", searchTerm, courseFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("subject", searchTerm);
      if (courseFilter && courseFilter !== "all") params.append("course", courseFilter);
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      const response = await fetch(`/api/admin/papers?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to fetch papers");
      }
      
      return response.json();
    },
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (paperId: string) => {
      const response = await fetch(`/api/admin/papers/${paperId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to delete paper");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Paper Deleted",
        description: "The question paper has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Delete Failed",
        description: "Failed to delete the question paper. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadPaper = async (paperId: string, title: string) => {
    try {
      const response = await fetch(`/api/papers/${paperId}/download`);
      if (!response.ok) throw new Error("Failed to download paper");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title + ".pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "The question paper is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the question paper.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.value} value={course.value}>
                  {course.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Papers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Subject</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {papersData?.papers?.length > 0 ? (
              papersData.papers.map((paper: any) => (
                <TableRow key={paper.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-academic-dark">{paper.subject}</div>
                      <div className="text-sm text-academic-medium">{paper.department}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-academic-dark">
                    {courseLabels[paper.course] || paper.course}
                  </TableCell>
                  <TableCell className="text-academic-dark">{paper.semester}</TableCell>
                  <TableCell className="text-academic-dark">{paper.academicYear}</TableCell>
                  <TableCell className="text-academic-medium">
                    {formatDate(paper.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {paper.downloadCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadPaper(paper.id, paper.title)}
                        className="text-academic-blue hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(paper.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm || courseFilter
                      ? "No papers found matching your criteria"
                      : "No papers uploaded yet"}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {papersData?.pagination && papersData.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-academic-medium">
            Showing {((papersData.pagination.page - 1) * papersData.pagination.limit) + 1} to{" "}
            {Math.min(papersData.pagination.page * papersData.pagination.limit, papersData.pagination.total)} of{" "}
            {papersData.pagination.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            {[...Array(Math.min(5, papersData.pagination.pages))].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-academic-blue" : ""}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === papersData.pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
