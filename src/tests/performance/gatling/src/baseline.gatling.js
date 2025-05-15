import { simulation, constantUsersPerSec, scenario } from "@gatling.io/core";
import { http, status, jsonBody } from "@gatling.io/http";

export default simulation(async (setUp) => {

  const baseUrl = "http://localhost:3000";

  const loginResponse = await http(baseUrl)
    .post("/login")
    .body(jsonBody({ username: "perfuser" }))
    .asJson()
    .send();

  const token = loginResponse.body.token;

  for (let i = 0; i < 500; i++) {
    await http(baseUrl)
      .post("/data")
      .header("Authorization", `Bearer ${token}`)
      .body(jsonBody({
        firstName: `Test${i}`,
        lastName: "User",
        dateOfBirth: "1990-01-01",
        country: "UK",
        postalCode: "AB12CD"
      }))
      .asJson()
      .send();
  }

  const httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .header("Authorization", `Bearer ${token}`);

  const scn = scenario("Get data from HammerAPI")
    .exec(http("GetAllData").get("/data").check(status().is(200)));

  setUp(
    scn.injectOpen(constantUsersPerSec(100).during(50)).protocols(httpProtocol)
  );
});