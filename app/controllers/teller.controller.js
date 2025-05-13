import tellerService from "../services/teller.service.js";
class tellerController {
  async getActiveTeller(request, reply) {
    try {
      const result = await tellerService.getActiveTellers();
      // console.log(result);
      reply.code(200).send({
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching active tellers.'
      });
    }
  }

  async getTellerStats(request, reply) {
    try {
      const result = await tellerService.getTellerStats();
      reply.code(200).send({
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching teller stats.'
      });
    }
  }

  async getTellerStatsByBranch(request, reply) {
    try {
      const stats = await tellerService.getTellerStatsByBranch();
      reply.code(200).send({
        statusCode: 200,
        data: stats,
      });
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching teller stats by branch.'
      });
    }
  }

  async getTellerById(request, reply) {
    const { id } = request.params;
    try {
      if(!tellerId){
        reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Teller ID is required.'
        })
      }
      if(typeof id !== 'string'){
        reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Teller ID must be a string.'
        })
      }

      const teller = await tellerService.getTellerById(id.toUpperCase());
      if (!teller) {
        reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Teller not found.'
        });
      }
      reply.code(200).send({
        statusCode: 200,
        data: teller,
      })
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching teller by ID.'
      });
    }
  }

  async getTellerByBranch(request, reply) {
    const { id } = request.params;
    try {
      const tellers = await tellerService.getTellerByBranchId(id);
      if (!tellers) {
        reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Teller not found.'
        });
      }
      reply.code(200).send({
        statusCode: 200,
        data: tellers,
      })
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching teller by branch.'
      });
    }
  }

  async getDashboardStats(request, reply) {
    try {
      const stats = await tellerService.getDashboardStats();
      reply.code(200).send({
        statusCode: 200,
        data: stats,
      });
    }
    catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching dashboard stats.'
      });
    }
  }


}

export default new tellerController();