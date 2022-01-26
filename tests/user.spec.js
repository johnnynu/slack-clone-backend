import axios from "axios";

describe("user resolvers", () => {
  test("allUsers", async () => {
    const response = await axios.post(
      "http://localhost:graphql/subscriptions",
      {
        query: `
            query {
                allUsers {
                    id
                    username
                    email
                }
            }
        `
      }
    );

    const { data } = response;
    expect(data).toMatchObject({
      data: {
        allUsers: [
          {
            id: 1,
            username: "virtualself",
            email: "vs@email.com"
          },
          {
            id: 2,
            username: "technicaAngel",
            email: "angelvoices@email.com"
          }
        ]
      }
    });
  });
});
