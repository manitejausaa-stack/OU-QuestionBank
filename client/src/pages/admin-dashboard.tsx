import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Upload, Settings, FileText, Plus, Download, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadForm from "@/components/upload-form";
import PapersTable from "@/components/papers-table";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-academic-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

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
                onClick={() => window.location.href = "/"}
                className="text-academic-medium hover:text-academic-blue font-medium"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = "/api/logout"}
                className="text-academic-medium hover:text-red-500 font-medium"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold text-academic-dark mb-2">Admin Dashboard</h2>
          <p className="text-academic-medium">Manage question papers and system settings</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-academic-medium">Total Papers</p>
                  <p className="text-3xl font-bold text-academic-dark">{stats?.totalPapers || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="text-academic-blue" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-academic-medium">This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.thisMonth || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Plus className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-academic-medium">Downloads</p>
                  <p className="text-3xl font-bold text-academic-accent">{stats?.totalDownloads || 0}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Download className="text-academic-accent" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-academic-medium">Active Courses</p>
                  <p className="text-3xl font-bold text-purple-600">{stats?.activeCourses || 6}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <GraduationCap className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload size={18} />
              <span>Upload Paper</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <Settings size={18} />
              <span>Manage Papers</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-heading">Upload New Question Paper</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <UploadForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-heading">Manage Question Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <PapersTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
