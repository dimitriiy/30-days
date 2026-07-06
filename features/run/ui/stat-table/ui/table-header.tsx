"use client";

import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const StatTableHeader = () => {
  return (
    <TableHeader className="sticky top-0 z-10 bg-background">
      <TableRow>
        <TableHead>W</TableHead>
        <TableHead>S</TableHead>
        <TableHead>D 1</TableHead>
        <TableHead>D 2</TableHead>
        <TableHead>D 3</TableHead>
        <TableHead>D 4</TableHead>
        <TableHead>D 5</TableHead>
        <TableHead>D 6</TableHead>
        <TableHead>D 7</TableHead>
      </TableRow>
    </TableHeader>
  );
};
