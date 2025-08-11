import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface PaperFilters {
  course: string;
  semester: string;
  academicYear: string;
  subject: string;
}

interface PaperFiltersProps {
  filters: PaperFilters;
  onFiltersChange: (filters: PaperFilters) => void;
}

const courses = [
  { value: "bsc", label: "BSC" },
  { value: "bcom", label: "BCOM" },
  { value: "bba", label: "BBA" },
  { value: "ba", label: "BA" },
];

const semesters = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
];

const academicYears = [
  { value: "2024-25", label: "2024-25" },
  { value: "2023-24", label: "2023-24" },
  { value: "2022-23", label: "2022-23" },
];

export default function PaperFilters({ filters, onFiltersChange }: PaperFiltersProps) {
  const updateFilter = (key: keyof PaperFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? "" : value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Course Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-academic-dark">Course</Label>
        <Select value={filters.course} onValueChange={(value) => updateFilter("course", value)}>
          <SelectTrigger className="focus:ring-2 focus:ring-academic-blue focus:border-transparent">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.value} value={course.value}>
                {course.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Semester Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-academic-dark">Semester</Label>
        <Select value={filters.semester} onValueChange={(value) => updateFilter("semester", value)}>
          <SelectTrigger className="focus:ring-2 focus:ring-academic-blue focus:border-transparent">
            <SelectValue placeholder="All Semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesters.map((semester) => (
              <SelectItem key={semester.value} value={semester.value}>
                {semester.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Academic Year Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-academic-dark">Academic Year</Label>
        <Select value={filters.academicYear} onValueChange={(value) => updateFilter("academicYear", value)}>
          <SelectTrigger className="focus:ring-2 focus:ring-academic-blue focus:border-transparent">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {academicYears.map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-academic-dark">Subject</Label>
        <Input
          type="text"
          placeholder="e.g., Data Structures"
          value={filters.subject}
          onChange={(e) => updateFilter("subject", e.target.value)}
          className="focus:ring-2 focus:ring-academic-blue focus:border-transparent"
        />
      </div>
    </div>
  );
}
