import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "JobDekho API",
      version: "1.0.0",
      description: "JobDekho Backend API Documentation"
    },

    servers: [
      {
        url: `${process.env.BASE_URL}`,
        description: "Local Development Server"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },

      schemas: {

        User: {
          type: "object",

          properties: {

            _id: {
              type: "string",
              example: "689f8f4b7c2a4b001f123456"
            },

            name: {
              type: "string",
              example: "username"
            },

            email: {
              type: "string",
              example: "user@example.com"
            },

            phone: {
              type: "string",
              example: "+919876543210"
            },

            role: {
              type: "string",
              enum: [
                "user",
                "company",
                "hr",
                "employee",
                "admin"
              ]
            },

            isVerified: {
              type: "boolean",
              example: false
            },

            accountStatus: {
              type: "string",
              enum: [
                "active",
                "suspended",
                "deleted"
              ]
            },

            lastLogin: {
              type: "string",
              format: "date-time"
            },

            isBlocked: {
              type: "boolean",
              example: false
            },

            createdAt: {
              type: "string",
              format: "date-time"
            },

            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        Profile: {
          type: "object",
          properties: {
            _id: {
              type: "string"
            },

            user: {
              $ref: "#/components/schemas/User"
            },

            title: {
              type: "string"
            },

            about: {
              type: "string"
            },

            gender: {
              type: "string"
            },

            profileImage: {
              type: "object",
              properties: {
                url: {
                  type: "string"
                },
                public_id: {
                  type: "string"
                }
              }
            },

            resume: {
              type: "object",
              properties: {
                url: {
                  type: "string"
                },
                public_id: {
                  type: "string"
                }
              }
            },

            languages: {
              type: "array",
              items: {
                type: "string"
              }
            },

            experienceLevel: {
              type: "string"
            },

            location: {
              type: "object",
              properties: {
                country: {
                  type: "string"
                },
                state: {
                  type: "string"
                },
                city: {
                  type: "string"
                },
                address: {
                  type: "string"
                },
                pincode: {
                  type: "string"
                }
              }
            },

            socialLinks: {
              type: "object",
              properties: {
                linkedin: {
                  type: "string"
                },
                github: {
                  type: "string"
                },
                portfolio: {
                  type: "string"
                }
              }
            },

            isProfileCompleted: {
              type: "boolean"
            },

            createdAt: {
              type: "string",
              format: "date-time"
            },

            updatedAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

      }
    },

    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: [
    "./routes/**/*.js",
    "./docs/**/*.js"
  ]


};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;