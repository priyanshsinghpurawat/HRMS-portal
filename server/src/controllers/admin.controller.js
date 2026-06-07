import { User } from "../models/User.model.js";
import { Company } from "../models/Company.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Get all users (role = "user")
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  return res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully")
  );
});

// 2. Get a single user (role = "user")
export const getSingleUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: "user" }).select("-password");
  if (!user) {
    return res.status(404).json(
      new ApiResponse(404, null, "User not found")
    );
  }
  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

// 3. Get all companies
export const getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find();
  return res.status(200).json(
    new ApiResponse(200, companies, "Companies fetched successfully")
  );
});

// 4. Get single company
export const getSingleCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    return res.status(404).json(
      new ApiResponse(404, null, "Company not found")
    );
  }
  return res.status(200).json(
    new ApiResponse(200, company, "Company fetched successfully")
  );
});

// 5. Get all HRs (role = "hr")
export const getAllHRs = asyncHandler(async (req, res) => {
  const hrs = await User.find({ role: "hr" }).select("-password");
  return res.status(200).json(
    new ApiResponse(200, hrs, "HRs fetched successfully")
  );
});

// 6. Get single HR (role = "hr")
export const getSingleHR = asyncHandler(async (req, res) => {
  const hr = await User.findOne({ _id: req.params.id, role: "hr" }).select("-password");
  if (!hr) {
    return res.status(404).json(
      new ApiResponse(404, null, "HR user not found")
    );
  }
  return res.status(200).json(
    new ApiResponse(200, hr, "HR fetched successfully")
  );
});

// 7. Block a company
export const blockCompany = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason || reason.trim().length < 3) {
    return res.status(400).json(
      new ApiResponse(400, null, "A valid reason (minimum 3 characters) is required to block a company")
    );
  }

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true, blockReason: reason.trim() },
    { new: true }
  );

  if (!company) {
    return res.status(404).json(
      new ApiResponse(404, null, "Company not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, company, "Company blocked successfully")
  );
});

// 8. Unblock a company
export const unblockCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false, blockReason: "" },
    { new: true }
  );

  if (!company) {
    return res.status(404).json(
      new ApiResponse(404, null, "Company not found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, company, "Company unblocked successfully")
  );
});

// 9. Delete a company
export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) {
    return res.status(404).json(
      new ApiResponse(404, null, "Company not found")
    );
  }
  return res.status(200).json(
    new ApiResponse(200, null, "Company deleted successfully")
  );
});

// 10. Get active companies (where isBlocked is false)
export const getActiveCompanies = asyncHandler(async (req, res) => {
  const activeCompanies = await Company.find({
    isBlocked: false,
    
  }).select("name isBlocked isActive");

  return res.status(200).json(
    new ApiResponse(
      200,
      activeCompanies,
      "Active companies fetched successfully"
    )
  );
});



// 11. Get active users (where role = "user" and isBlocked is false)
export const getActiveUsers = asyncHandler(async (req, res) => {
  const activeUsers = await User.find({ role: "user", isBlocked: false }).select("-password");
  return res.status(200).json(
    new ApiResponse(200, activeUsers, "Active users fetched successfully")
  );
});

// 12. Get blocked companies (where isBlocked is true)
export const getBlockedCompanies = asyncHandler(async (req, res) => {
  const blockedCompanies = await Company.find({ isBlocked: true });
  return res.status(200).json(
    new ApiResponse(200, blockedCompanies, "Blocked companies fetched successfully")
  );
});