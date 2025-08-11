import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, Download, Search, Plus, FileText, Calendar, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PaperFilters from "@/components/paper-filters";
import PaperCard from "@/components/paper-card";

interface PaperFilters {
  course: string;
  semester: string;
  academicYear: string;
  subject: string;
}

export default function PublicHome() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [filters, setFilters] = useState<PaperFilters>({
    course: "",
    semester: "",
    academicYear: "",
    subject: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { data: papersData, isLoading } = useQuery({
    queryKey: ["/api/papers", filters, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.course) params.append("course", filters.course);
      if (filters.semester) params.append("semester", filters.semester);
      if (filters.academicYear) params.append("academicYear", filters.academicYear);
      if (filters.subject) params.append("subject", filters.subject);
      params.append("page", currentPage.toString());
      params.append("limit", "6");

      const response = await fetch(`/api/papers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch papers");
      return response.json();
    },
  });

  const handleFilterChange = (newFilters: PaperFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    // Trigger search with current filters - query will automatically refetch
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b-2 border-academic-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-heading font-bold text-academic-blue">
                  <GraduationCap className="inline mr-2" size={28} />
                  UniPapers
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-academic-medium hover:text-academic-blue font-medium"
              >
                <span className="fas fa-home mr-1"></span>Home
              </Button>
              {!authLoading && !isAuthenticated && (
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-academic-blue text-white hover:bg-blue-700"
                >
                  <span className="fas fa-user-shield mr-1"></span>Admin Login
                </Button>
              )}
              {!authLoading && isAuthenticated && (
                <>
                  <Button
                    onClick={() => window.location.href = "/admin"}
                    className="bg-academic-accent text-white hover:bg-orange-600"
                  >
                    <span className="fas fa-tachometer-alt mr-1"></span>Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = "/api/logout"}
                    className="text-academic-medium hover:text-red-500 font-medium"
                  >
                    <span className="fas fa-sign-out-alt mr-1"></span>Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-academic-blue to-academic-light text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Find Your Question Papers
          </h2>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Access previous year question papers for all courses and subjects
          </p>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white text-left shadow-lg">
              <CardContent className="p-6">
                <PaperFilters filters={filters} onFiltersChange={handleFilterChange} />
                <div className="text-center mt-4">
                  <Button
                    onClick={handleSearch}
                    className="bg-academic-blue text-white px-8 py-3 hover:bg-blue-700 text-lg"
                  >
                    <Search className="mr-2" size={20} />
                    Search Papers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h3 className="text-2xl font-heading font-semibold text-academic-dark mb-2">
            {filters.course || filters.semester || filters.academicYear || filters.subject
              ? "Search Results"
              : "Recent Question Papers"}
          </h3>
          <p className="text-academic-medium">
            {filters.course || filters.semester || filters.academicYear || filters.subject
              ? "Papers matching your criteria"
              : "Latest uploads from our academic database"}
          </p>
        </div>

        {/* Papers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : papersData?.papers?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {papersData.papers.map((paper: any) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>

            {/* Pagination */}
            {papersData.pagination.pages > 1 && (
              <div className="text-center mt-12">
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
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
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-academic-blue" : ""}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === papersData.pagination.pages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
              <p className="text-gray-500">
                {filters.course || filters.semester || filters.academicYear || filters.subject
                  ? "Try adjusting your search criteria"
                  : "No question papers have been uploaded yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics Section */}
      <div className="bg-academic-gray py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-heading font-bold text-academic-dark mb-4">
              Our Academic Repository
            </h3>
            <p className="text-xl text-academic-medium">
              Comprehensive collection of question papers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-academic-blue text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h4 className="text-3xl font-heading font-bold text-academic-dark mb-2">
                {papersData?.pagination?.total || 0}
              </h4>
              <p className="text-academic-medium">Question Papers</p>
            </div>
            <div className="text-center">
              <div className="bg-academic-accent text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} />
              </div>
              <h4 className="text-3xl font-heading font-bold text-academic-dark mb-2">4</h4>
              <p className="text-academic-medium">Courses</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} />
              </div>
              <h4 className="text-3xl font-heading font-bold text-academic-dark mb-2">100+</h4>
              <p className="text-academic-medium">Subjects</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} />
              </div>
              <h4 className="text-3xl font-heading font-bold text-academic-dark mb-2">5</h4>
              <p className="text-academic-medium">Academic Years</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-academic-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4">
                <GraduationCap className="inline mr-2" size={24} />
                UniPapers
              </h3>
              <p className="text-gray-300 mb-4">
                Your comprehensive academic resource for previous year question papers across all university courses and subjects.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-heading font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">All Question Papers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Browse by Course</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Recent Uploads</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-heading font-semibold mb-4">Courses</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">BSC Papers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">BCOM Papers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">BBA Papers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">BA Papers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 UniPapers. All rights reserved. Academic Resource Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
