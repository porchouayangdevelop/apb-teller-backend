const okSchema = {
  description: "OK",
  type: "object",
  properties: {
    statusCode: { type: "number" },
    data: { type: "array" },

  }
}

const notFoundSchema = {
  description: "Not Found",
  type: "object",
  properties: {
    statusCode: { type: "number" },
    error: { type: "string" },
    message: { type: "string" },
  }
}

const badRequestSchema = {
  description: "Bad Request",
  type: "object",
  properties: {
    statusCode: { type: "number" },
    error: { type: "string" },
    message: { type: "string" },
  }
}

const internalServerErrorSchema = {
  description: "Internal Server Error",
  type: "object",
  properties: {
    statusCode: { type: "number" },
    error: { type: "string" },
    message: { type: "string" },
  }
}

export const tellerSchema = {
  active: {
    summary: "Get Teller active Information",
    description: "Get Teller active Information",
    tags: ["Tellers"],
    response: {
      200: {
        description: "Successful response",
        type: "object",
        properties: {
          statusCode: { type: "number" },
          data: {
            type: "array",
            properties: {
              teller: { type: "string" },
              branch: { type: "string" },
              name: { type: "string" },
              level: { type: "number" },
              type: { type: "string" },
              department: { type: "string" },
              sign_status: { type: "string" },
            }
          }
        }
      },
      400: badRequestSchema,
      500: internalServerErrorSchema,
    }
  },
  stats: {
    summary: "Get Teller Count by Status",
    description: "Get Teller Count by Status",
    tags: ["Tellers"],
    response: {
      200: {
        description: "Successful response",
        type: "object",
        properties: {
          statusCode: { type: "number" },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: { type: "string" },
                count: { type: "number" },
              }
            }
          }
        }
      },
      400: badRequestSchema,
      500: internalServerErrorSchema,
    },

  },
  statsByBranch: {
    summary: "Get Teller Count by Branch",
    description: "Get Teller Count by Branch",
    tags: ["Tellers"],
    response: {
      200: {
        description: "Successful response",
        type: "object",
        properties: {
          data: {
            type: "array",
            properties: {
              branch: { type: "string" },
              online: { type: "number" },
              temp_logout: { type: "number" },
            }
          }
        },
      },
      400: badRequestSchema,
      500: internalServerErrorSchema,
    }
  },
  dashboardStats: {
    summary: "Get Dashboard Stats",
    description: "Get Dashboard Stats",
    tags: ["Tellers"],
    response: {
      200: {
        description: "Successful response",
        type: "object",
        properties: {
          statusCode: { type: "number" },
          data: {
            type: "object",
            properties: {
              tellers: { type: "array" },
              stats: { type: "array" },
              branchStats: { type: "array" },
            }
          }
        }
      },
      400: badRequestSchema,
      500: internalServerErrorSchema
    }
  },
  tellerId: {
    summary: "Get Teller by ID",
    description: "Get Teller by ID",
    tags: ["Tellers"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        tellerId: { type: "string" },
      }
    },
    response: {
      200: {
        description: "Successful response",
        type: "object",
        properties: {
          statusCode: { type: "number" },
          data: {
            type: "array",
            properties: {
              teller: { type: "string" },
              branch: { type: "string" },
              name: { type: "string" },
              level: { type: "string" },
              type: { type: "string" },
              department: { type: "string" },
              sign_status: { type: "string" },
            }
          }
        }
      },
      400: badRequestSchema,
      404: notFoundSchema,
      500: internalServerErrorSchema
    }
  },
  branchId: {
    summary: "Get Teller by Branch ID",
    description: "Get Teller by Branch ID",
    tags: ["Tellers"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        branchId: { type: "string" },
      }
    },
    response: {
      200: {
        description: "Successful response",
        type: "object",
        properties: {
          statusCode: { type: "number" },
          data: {
            type: "array",
            properties: {
              teller: { type: "string" },
              branch: { type: "string" },
              name: { type: "string" },
              level: { type: "string" },
              type: { type: "string" },
              department: { type: "string" },
              sign_status: { type: "string" },
            }
          }
        }
      },
      400: badRequestSchema,
      404: notFoundSchema,
      500: internalServerErrorSchema,
    }
  }
}

