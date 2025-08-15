import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { STATIC_TOKEN, BASE_URL } from "./config.js";

export default simulation((setUp) => {
  const httpProtocol = http
    .baseUrl(BASE_URL)
    .acceptHeader("application/json");
  
  const staticToken = STATIC_TOKEN;
  
  const scn = scenario("HammerAPI Static Token Test")
    .exec(
      http("Get Data")
        .get("/data")
        .header("Authorization", `Bearer ${staticToken}`)
        .check(status().is(200))
    );
  
  setUp(scn.injectOpen(constantUsersPerSec(100).during(60))).protocols(httpProtocol);
});