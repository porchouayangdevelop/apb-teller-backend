import tellerController from "../controllers/teller.controller.js";
import { tellerSchema } from "../schemas/schema.js";
export default async function (fastify, opts) {
  fastify.get('/count', {
    schema: tellerSchema.count,
    handler: tellerController.getAllTellers,
  });

  fastify.get("/", {
    schema: tellerSchema.active,
    handler: tellerController.getActiveTeller,
  });

  fastify.get("/stats", {
    schema: tellerSchema.stats,
    handler: tellerController.getTellerStats,
  });

  fastify.get("/branch-stats", {
    schema: tellerSchema.statsByBranch,
    handler: tellerController.getTellerStatsByBranch,
  });

  fastify.get("/branch-signed-out-count", {
    schema: tellerSchema.statsByBranchSignedOut,
    handler: tellerController.getTellerCountStatsByBranchSignedOut,
  });

  fastify.get("/branch-signed-count", {
    schema: tellerSchema.statsByBranchSignedIn,
    handler: tellerController.getTellerCountsByBranchSigned,
  });

  fastify.get("/branch-temporary-signed-out-count", {
    schema: tellerSchema.statsByBranchTemporarySignedOut,
    handler: tellerController.getTellCountStatsByBranchTemporarySignedOut,
  });

  fastify.get("/branches-signed-in", {
    schema: tellerSchema.branchesWithSignedIn,
    handler: tellerController.getBranchesWithSignedInTellers,
  });

  fastify.get("/branches-temporary-signed-out", {
    schema: tellerSchema.branchesWithTemporarySignedOut,
    handler: tellerController.getBranchesWithTemporaryLogout,
  });

  // branch with signed-out tellers - formal logout
  fastify.get("/branches-signed-out", {
    schema: tellerSchema.branchesWithSignedOut,
    handler: tellerController.getBranchesWithSignedOutTellers,
  });

  fastify.get("/total-tellers", {
    schema: tellerSchema.totalTellers,
    handler: tellerController.getTotalTellers,
  });

  fastify.get("/dashboard", {
    schema: tellerSchema.dashboard,
    handler: tellerController.getDashboardStats,
  });


  fastify.get("/:id", {
    schema: tellerSchema.tellerId,
    handler: tellerController.getTellerById,
  });

  fastify.get("branch/:id", {
    schema: tellerSchema.branchId,
    handler: tellerController.getTellerByBranch,
  });

  fastify.get("/business-date", {
    schema: tellerSchema.businessDate,
    handler: tellerController.getBusinessDate,
  })


  fastify.get("/ws", { websocket: true }, (socket, req) => {
    console.log(`Client connected`);


    const sendData = async () => {
      try {
        console.log(`Fetching dashboard data to sent overt Websocket...`);

        const data = await tellerController.getDashboardStats();

        if (!data.data.tellers) {
          console.error(`Error fetching dashboard data ${Object.keys(data)}`);
          return;
        }

        const resultMap = {
          count: data.data.tellerCount,
          tellers: data.data.tellers.length,
          stats: data.data.stats.length,
          branchStats: data.data.branchStats.length,

          branchSignedIn: data.data.count.branchSignedIn,
          branchTemporarySignedOut: data.data.count.branchTempSignedOut, // Add this line for branchTemporarySignedOut informatio
          branchSignedOut: data.data.count.branchSignedOut,

          totalTellers: data.data.totalTellers.totalCount,

          // actual data
          branchesWithSignedIn: data.data.branchDetails.branchesWithSignedIn,
          branchesWithTemporarySignedOut: data.data.branchDetails.branchesWithTempLogout,
          branchesWithSignedOut: data.data.branchDetails.branchesWithSignedOut,

          businessDate: data.data.businessDate.current_date,
        }

        // fastify.log.info(`Sending data : 
        //   TotalCount : ${JSON.stringify(resultMap.count)} tellers
        //   TotalTellers : ${resultMap.tellers} tellers
        //   TotalStats : ${resultMap.stats} stats
        //   TotalBranchStats : ${resultMap.branchStats} branchStats
        //   TotalBranchSignedIn : ${resultMap.branchSignedIn} branchSignedIn
        //   TotalBranchTemporarySignedOut : ${resultMap.branchTemporarySignedOut} branchTemporarySignedOut
        //   TotalBranchSignedOut : ${resultMap.branchSignedOut} branchSignedOut
        //   TotalTellers : ${resultMap.totalTellers} totalTellers
        //   BusinessDate : ${resultMap.businessDate} businessDate
        // `);
        //   BranchesWithSignedIn : ${resultMap.branchesWithSignedIn} branchesWithSignedIn
        //   BranchesWithTemporarySignedOut : ${resultMap.branchesWithTemporarySignedOut} branchesWithTemporarySignedOut
        //   BranchesWithSignedOut : ${resultMap.branchesWithSignedOut} branchesWithSignedOut

        socket.send(JSON.stringify(data));
      } catch (error) {
        console.error(error);
        socket.send(JSON.stringify({
          responseCode: 500,
          error: "Internal Server Error",
          message: "An error occurred while fetching dashboard stats.",
        }));
      }
    };

    sendData();
    const intervalId = setInterval(sendData, 5000);

    socket.on("close", () => {
      console.log(`Client disconnected`);
      clearInterval(intervalId);
    });


    socket.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        console.log(`Received message : ${data}`);

        if (data.type === "refresh") {
          sendData();
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
  });
}