import ApiResponse from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

export const healthController = asyncHandler(async (req, res) => {
  console.log("health controller");
  return res
    .status(200)
    .json(new ApiResponse(200, [], "server is working properly"));
});
