import tellerService from "../services/teller.service.js";
class tellerController {
  async getAllTellers(request, reply) {
    try {
      const result = await tellerService.getAllTellers();
      reply.code(200).send({ result });
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching all tellers.'
      });
    }
  }

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
      if (!id) {
        reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Teller ID is required.'
        })
      }
      if (typeof id !== 'string') {
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

  // Get count of branches with signed-in tellers
  async getTellerCountsByBranchSigned(request, reply) {
    try {
      const result = await tellerService.getTellerCountStatsByBranchSignedIn();
      reply.code(200).send({
        statusCode: 200,
        data: { count: result },
      });
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching signed-in teller count stats by branch.'
      })
    }
  }

  // Get count of branches with temporary logged out tellers
  async getTellCountStatsByBranchTemporarySignedOut(request, reply) {
    try {
      const result = await tellerService.getTellCountStatsByBranchTemporarySignedOut();
      reply.code(200).send({
        statusCode: 200,
        data: { count: result },
      });
    }
    catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching temporary signed-out teller count stats by branch.'
      })
    }
  }

  // Get count of branches with signed-out tellers
  async getTellerCountStatsByBranchSignedOut(request, reply) {
    try {
      const result = await tellerService.getTellerCountStatsByBranchSignedOut();
      reply.code(200).send({
        statusCode: 200,
        data: { count: result },
      });
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching teller count stats by branch.'
      });
    }
  }

  // Get total teller counts
  async getTotalTellers(request, reply) {
    try {
      const result = await tellerService.getTotalTellers();
      reply.code(200).send({
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching total tellers.'
      })
    }
  }

  // Get branches with signed-in tellers (actual data)
  async getBranchesWithSignedInTellers(request, reply) {
    try {
      const result = await tellerService.getBranchesWithSignedInTellers();
      return reply.code(200).send({
        statusCode: 200,
        data: result,
        message: "Branches with signed-in tellers"
      });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching branches with signed-in tellers.'
      });
    }
  }

  //  Get branches with temporary logged out tellers (actual data)
  async getBranchesWithTemporaryLogout(request, reply) {
    try {
      const result = await tellerService.getBranchesWithTemporaryLogout();
      return reply.code(200).send({
        statusCode: 200,
        data: result,
        message: "Branches with temporary logged out tellers"
      });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching branches with temporary logged out tellers.'
      });
    }
  }

  // Get branches with signed out tellers (actual data)
  async getBranchesWithSignedOutTellers(request, reply) {
    try {
      const result = await tellerService.getBranchesWithSignedOutTellers();
      return reply.code(200).send({
        statusCode: 200,
        data: result,
        message: "Branches with signed out tellers"
      });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching branches with signed out tellers.'
      });
    }
  }

  // Get business data (actual data)

  async getBusinessDate(request, reply) {
    try {
      const result = await tellerService.getBusinessDate();
      return reply.code(200).send({
        statusCode: 200,
        data: result,
      });

    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching business data.'
      });
    }
  }

  async getDashboardStats(request, reply) {
    try {
      const stats = await tellerService.getDashboardStats();
      if (reply) {
        return reply.code(200)
          .send({
            statusCode: 200,
            data: stats
          })
      }
      return {
        statusCode: 200,
        data: stats
      };
    }
    catch (error) {
      console.error(error);
      if (reply) {
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An error occurred while fetching dashboard stats.'
        });
      }
      throw error;
    }
  }


}

export default new tellerController();