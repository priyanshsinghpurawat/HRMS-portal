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

        Certification: {
          type: "object",
          properties: {
            _id: {
              type: "string"
            },

            user: {
              type: "string"
            },

            certificationName: {
              type: "string",
              example: "AWS Certified Developer Associate"
            },

            issuingOrganization: {
              type: "string",
              example: "Amazon Web Services"
            },

            issueDate: {
              type: "string",
              format: "date"
            },

            expirationDate: {
              type: "string",
              format: "date",
              nullable: true
            },

            doesNotExpire: {
              type: "boolean"
            },

            credentialId: {
              type: "string",
              example: "AWS-123456"
            },

            credentialUrl: {
              type: "string",
              example: "https://aws.amazon.com/verify"
            },

            description: {
              type: "string"
            },

            certificate: {
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

            isDeleted: {
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

        Experience: {
          type: "object",

          properties: {
            _id: {
              type: "string"
            },

            user: {
              type: "string"
            },

            company: {
              type: "string",
              example: "Google"
            },

            title: {
              type: "string",
              example: "Software Engineer"
            },

            experienceLevel: {
              type: "string",
              enum: [
                "fresher",
                "0-1 years",
                "1-3 years",
                "3-5 years",
                "5-7 years",
                "7-10 years",
                "10-15 years",
                "15+ years"
              ]
            },

            startDate: {
              type: "string",
              format: "date"
            },

            endDate: {
              type: "string",
              format: "date",
              nullable: true
            },

            currentlyWorking: {
              type: "boolean"
            },

            description: {
              type: "string"
            },

            isDeleted: {
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

        Application: {
          type: "object",
          properties: {
            _id: { type: "string" },
            job: { type: "string" },
            applicant: { type: "string" },
            resume: { type: "string" },
            coverLetter: { type: "string" },
            candidateStatus: { type: "string" },
            appliedAt: { type: "string", format: "date-time" }
          }
        },

        Offer: {
          type: "object",
          properties: {
            _id: { type: "string" },
            application: { type: "string" },
            candidate: { type: "string" },
            company: { type: "string" },
            designation: { type: "string" },
            department: { type: "string" },
            annualCTC: { type: "number" },
            joiningDate: { type: "string", format: "date" },
            offerLetterUrl: { type: "string" },
            status: { type: "string", enum: ["sent", "accepted", "rejected", "expired"] }
          }
        },

        Employee: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            company: { type: "string" },
            employeeId: { type: "string" },
            personalEmail: { type: "string" },
            companyEmail: { type: "string" },
            department: { type: "string" },
            designation: { type: "string" },
            joiningDate: { type: "string", format: "date" },
            reportingManager: { type: "string", nullable: true },
            employmentStatus: { type: "string", enum: ["active", "inactive", "terminated"] },
            phone: { type: "string" },
            address: { type: "string" },
            emergencyContact: { type: "string" }
          }
        }

      }
    },

    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: [
    "./src/routes/**/*.js",
    "./src/docs/**/*.js"
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;