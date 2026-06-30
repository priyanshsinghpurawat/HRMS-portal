import PDFDocument from 'pdfkit';

/**
 * Generates a PDF buffer from a Payslip object
 */
export const generatePdfBuffer = async (payslip, company, employee) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header: Company Info ---
            doc.fontSize(20).text(company.companyName, { align: 'center' });
            doc.fontSize(10).text(`Payslip for ${payslip.payrollMonth}/${payslip.payrollYear}`, { align: 'center' });
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // --- Employee Info ---
            doc.fontSize(12).text(`Employee Name: ${employee.name}`);
            doc.text(`Employee ID: ${employee.employeeId || 'N/A'}`);
            doc.text(`Department: ${employee.department || 'N/A'}`);
            doc.text(`Payslip Number: ${payslip.payslipNumber}`);
            doc.moveDown();

            // --- Attendance Summary ---
            doc.fontSize(14).text('Attendance Summary', { underline: true });
            doc.fontSize(10).text(`Total Days: ${payslip.attendanceSummary.totalCalendarDays} | Paid Days: ${payslip.attendanceSummary.paidDays} | LOP Days: ${payslip.attendanceSummary.unpaidDays}`);
            doc.moveDown();

            // --- Salary Components Layout ---
            const startY = doc.y;
            
            // Earnings Column
            doc.fontSize(12).text('Earnings', 50, startY, { underline: true });
            let currentY = startY + 20;
            for (const [key, value] of Object.entries(payslip.earnings)) {
                if (value > 0) {
                    doc.fontSize(10).text(`${key}:`, 50, currentY);
                    doc.text(`${value}`, 200, currentY, { align: 'right', width: 50 });
                    currentY += 15;
                }
            }
            const earningsEndY = currentY;

            // Deductions Column
            doc.fontSize(12).text('Deductions', 300, startY, { underline: true });
            currentY = startY + 20;
            for (const [key, value] of Object.entries(payslip.deductions)) {
                if (value > 0) {
                    doc.fontSize(10).text(`${key}:`, 300, currentY);
                    doc.text(`${value}`, 450, currentY, { align: 'right', width: 50 });
                    currentY += 15;
                }
            }
            const deductionsEndY = currentY;

            // --- Totals ---
            const finalY = Math.max(earningsEndY, deductionsEndY) + 20;
            doc.moveTo(50, finalY - 5).lineTo(550, finalY - 5).stroke();
            
            doc.fontSize(12).text(`Gross Salary: Rs. ${payslip.grossSalary}`, 50, finalY);
            // Calculate total deductions for display
            const totalDeds = Object.values(payslip.deductions).reduce((sum, val) => sum + (Number(val) || 0), 0);
            doc.text(`Total Deductions: Rs. ${totalDeds}`, 300, finalY);
            
            doc.moveDown();
            doc.fontSize(14).text(`Net Salary: Rs. ${payslip.netSalary}`, { align: 'right' });

            // --- Footer ---
            doc.moveDown(3);
            doc.fontSize(8).text('This is a system generated payslip and does not require a signature.', { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
