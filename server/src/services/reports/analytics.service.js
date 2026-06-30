import { Payroll } from "../../models/Payroll.model.js";

/**
 * Calculates Month-over-Month payroll growth and basic analytics
 */
export const getPayrollAnalytics = async (companyId, year) => {
    const pipeline = [
        { 
            $match: { 
                companyId, 
                payrollYear: parseInt(year, 10),
                status: { $in: ['Approved', 'Locked', 'Paid'] }
            } 
        },
        {
            $group: {
                _id: "$payrollMonth",
                totalCost: { $sum: "$grossSalary" },
                headcount: { $sum: 1 },
                averageSalary: { $avg: "$grossSalary" },
                maxSalary: { $max: "$grossSalary" },
                minSalary: { $min: "$grossSalary" },
                totalOvertime: { $sum: "$earnings.overtime" }
            }
        },
        { $sort: { _id: 1 } } // Sort by month ascending
    ];

    const monthlyTrends = await Payroll.aggregate(pipeline);

    // Calculate Growth logic
    const analysis = monthlyTrends.map((monthData, index) => {
        let growthPercent = 0;
        if (index > 0) {
            const previousCost = monthlyTrends[index - 1].totalCost;
            if (previousCost > 0) {
                growthPercent = ((monthData.totalCost - previousCost) / previousCost) * 100;
            }
        }
        return {
            month: monthData._id,
            totalCost: monthData.totalCost,
            headcount: monthData.headcount,
            averageSalary: Math.round(monthData.averageSalary),
            highestSalary: monthData.maxSalary,
            lowestSalary: monthData.minSalary,
            totalOvertime: monthData.totalOvertime,
            costGrowthPercent: parseFloat(growthPercent.toFixed(2))
        };
    });

    return analysis;
};
