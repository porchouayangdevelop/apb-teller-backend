import tellerController from "../controllers/teller.controller.js";
import { tellerSchema } from "../schemas/schema.js";
export  default async function (fastify, opts) {
  fastify.get("/",{
    schema:tellerSchema.active,
    handler: tellerController.getActiveTeller,
  });

  fastify.get("/stats",{
    schema:tellerSchema.stats,
    handler: tellerController.getTellerStats,
  })

  fastify.get("/branch-stats",{
    schema:tellerSchema.statsByBranch,
    handler: tellerController.getTellerStatsByBranch,
  })

  fastify.get("/:id",{
    schema:tellerSchema.tellerId,
    handler: tellerController.getTellerById,
  });

  fastify.get("branch/:id",{
    schema:tellerSchema.branchId,
    handler: tellerController.getTellerByBranch,
  });


  fastify.get("/ws",{websocket:true},(connection,req)=>{
    console.log(`Client connected with ID: ${connection.socket.id}`);

    const sendData = async ()=>{
      try {
        const result = await  tellerController.getDashboardStats();
        connection.socket.send(JSON.stringify(result));
      } catch (error) {
        console.error(error);
      }
    };

    sendData();
    const intervalId = setInterval(sendData,10000);

    connection.socket.on("close",()=>{
      console.log(`Client disconnected with ID: ${connection.socket.id}`);
      clearInterval(intervalId);
    })
    
  })
}