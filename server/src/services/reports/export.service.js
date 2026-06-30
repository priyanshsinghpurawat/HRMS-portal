import { Parser } from "json2csv";
import * as xlsx from "xlsx";
import { getPayrollRegister } from "./payrollReport.service.js";

/**
 * Handles generating CSV or XLSX buffers from report data
 */
export const generateReportExport = async (companyId, query, exportType) => {
    // For exports, we generally want all data without pagination limits (or a very high limit)
    query.limit = 10000;
    
    const { data } = await getPayrollRegister(companyId, query);

    // Flatten the nested payload for tabular export
    const flatData = data.map(record => ({
        Employee_ID: record.employeeId?.employeeId || 'N/A',
        Name: record.employeeId?.name || 'Unknown',
        Department: record.employeeId?.department || 'N/A',
        Period: `${record.payrollMonth}/${record.payrollYear}`,
        Status: record.status,
        Paid_Days: record.attendanceSummary.paidDays,
        Gross_Salary: record.grossSalary,
        PF: record.deductions.pf,
        ESIC: record.deductions.esic,
        PT: record.deductions.pt,
        Net_Salary: record.netSalary
    }));

    if (exportType === 'csv') {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(flatData);
        return {
            buffer: Buffer.from(csv),
            contentType: 'text/csv',
            extension: 'csv'
        };
    } else if (exportType === 'xlsx') {
        const worksheet = xlsx.utils.json_to_sheet(flatData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Payroll_Report");
        
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        return {
            buffer: excelBuffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            extension: 'xlsx'
        };
    } else {
        throw new Error("Unsupported export type");
    }
};
