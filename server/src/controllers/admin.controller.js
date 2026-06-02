import { User } from "../models/User.model.js"
// import { Employee } from "../models/Employee.model.js"
import { Job } from "../models/Job.model.js"
import { Company } from "../models/Company.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//Get all users
export const getAllUsers = asyncHandler(
  async (req, res) => {

    const users = await User.find()
      .select("-password");

    return res.status(200).json(
      new ApiResponse(
        200,
        users,
        "Users fetched successfully"
      )
    );
  }
);


//Get total number of users
export const getUserCount = asyncHandler(
  async (req, res) => {

    const totalUsers =
      await User.countDocuments();

    return res.status(200).json(
      new ApiResponse(
        200,
        { totalUsers },
        "User count fetched successfully"
      )
    );
  }
);



//Get a single user
export const getSingleUser = asyncHandler(
  async (req, res) => {

    const user =
      await User.findById(
        req.params.id
      ).select("-password");

    if (!user) {
      return res.status(404).json(
        new ApiResponse(
          404,
          null,
          "User not found"
        )
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "User fetched successfully"
      )
    );
  }
);


//Block the user if found guilty
export const blockUser = asyncHandler(
  async (req, res) => {

    const user =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          isBlocked: true
        },
        {
          new: true
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "User blocked successfully"
      )
    );
  }
);



//Delete the user if found guilty
export const deleteUser = asyncHandler(
  async (req, res) => {

    await User.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "User deleted successfully"
      )
    );
  }
);


//Get all companies
export const getAllCompanies =
  asyncHandler(async (req, res) => {

    const companies =
      await Company.find();

    return res.status(200).json(
      new ApiResponse(
        200,
        companies,
        "Companies fetched successfully"
      )
    );
  });


//Approve the company if found genuine
  export const approveCompany =
  asyncHandler(async (req, res) => {

    const company =
      await Company.findByIdAndUpdate(
        req.params.id,
        {
          isVerified: true
        },
        {
          new: true
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        company,
        "Company approved successfully"
      )
    );
  });


//Reject the company if found fraudulent
  export const rejectCompany =
  asyncHandler(async (req, res) => {

    const company =
      await Company.findByIdAndUpdate(
        req.params.id,
        {
          isVerified: false
        },
        {
          new: true
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        company,
        "Company rejected successfully"
      )
    );
  });


//Get all jobs
  export const getAllJobs =
  asyncHandler(async (req, res) => {

    const jobs =
      await Job.find();

    return res.status(200).json(
      new ApiResponse(
        200,
        jobs,
        "Jobs fetched successfully"
      )
    );
  });


//Block the job if found fraudulent
  export const blockFraudJob =
  asyncHandler(async (req, res) => {

    const job =
      await Job.findByIdAndUpdate(
        req.params.id,
        {
          isBlocked: true
        },
        {
          new: true
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        job,
        "Job blocked successfully"
      )
    );
  });

  //Add this in JobSchema for admin to block the job
// isBlocked: {
//   type: Boolean,
//   default: false
// }



//Get total employees in a company
  export const getCompanyEmployeeCount =
  asyncHandler(async (req, res) => {

    const totalEmployees =
      await Employee.countDocuments({
        companyId:
          req.params.companyId
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        { totalEmployees },
        "Employee count fetched successfully"
      )
    );
  });


//Get all dashboard stats
  export const dashboardStats =
  asyncHandler(async (req, res) => {

    const totalUsers =
      await User.countDocuments();

    const totalCompanies =
      await Company.countDocuments();

    const totalJobs =
      await Job.countDocuments();

    // const totalEmployees =
      // await Employee.countDocuments();

    const verifiedCompanies =
      await Company.countDocuments({
        isVerified: true
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalUsers,
          totalCompanies,
          totalJobs,
         // totalEmployees,
          verifiedCompanies
        },
        "Dashboard stats fetched successfully"
      )
    );
  });



  export const unblockUser = asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isBlocked: false },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User unblocked successfully"
        )
    );
});


export const deleteCompany = asyncHandler(async (req, res) => {

    await Company.findByIdAndDelete(req.params.id);

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Company deleted successfully"
        )
    );
});


export const unblockJob = asyncHandler(async (req, res) => {

    const job = await Job.findByIdAndUpdate(
        req.params.id,
        { isBlocked: false },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            job,
            "Job unblocked successfully"
        )
    );
});


export const getSingleCompany = asyncHandler(async (req, res) => {

    const company = await Company.findById(req.params.id);

    return res.status(200).json(
        new ApiResponse(
            200,
            company,
            "Company fetched successfully"
        )
    );
});

export const getSingleJob = asyncHandler(async (req, res) => {

    const job = await Job.findById(req.params.id);

    return res.status(200).json(
        new ApiResponse(
            200,
            job,
            "Job fetched successfully"
        )
    );
});

export const getPendingCompanies =
asyncHandler(async (req, res) => {

    const pendingCompanies =
    await Company.countDocuments({
        isVerified: false
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { pendingCompanies },
            "Pending companies fetched successfully"
        )
    );
});