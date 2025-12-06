"use client";

interface DataTableProps {
  data: any[];
}

export default function DataTable({ data }: DataTableProps) {
  if (data.length === 0) return null;

  // Get all unique keys from the data to create columns
  const allKeys = new Set<string>();
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (row[key] !== null && row[key] !== undefined && row[key] !== "") {
        allKeys.add(key);
      }
    });
  });

  const columns = Array.from(allKeys).filter(key => key !== "__parsed_extra");

  // Format cell value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "number") {
      // Format numbers nicely
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      return value.toFixed(1);
    }
    return String(value);
  };

  // Format column headers
  const formatHeader = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Your Health Data</h3>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {formatHeader(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((key) => (
                  <td
                    key={key}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatValue(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Showing {data.length} record{data.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

