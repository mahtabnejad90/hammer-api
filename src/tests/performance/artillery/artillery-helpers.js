const http = require('http');

module.exports = {
  loginAndInsert: async function (userContext, events, done) {
    const baseUrl = "http://localhost:1990";

    const loginRes = await http.post(`${baseUrl}/login`, {
      json: { username: "perfuser" },
    });
    const token = loginRes.json().token;
    userContext.vars.token = token;

    for (let i = 0; i < 500; i++) {
      await http.post(`${baseUrl}/data`, {
        headers: { Authorization: `Bearer ${token}` },
        json: {
          firstName: `Test${i}`,
          lastName: "User",
          dateOfBirth: "1990-01-01",
          country: "UK",
          postalCode: "AB12CD"
        },
      });
    }

    return done();
  },
};