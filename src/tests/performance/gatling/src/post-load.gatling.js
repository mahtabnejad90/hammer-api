import { constantUsersPerSec, scenario, simulation, StringBody } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { STATIC_TOKEN, BASE_URL } from "./config.js";

export default simulation((setUp) => {
  const httpProtocol = http
    .baseUrl(BASE_URL)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json");
  
  const staticToken = STATIC_TOKEN;
  
  const scn = scenario("HammerAPI POST Load Test")
    .exec(
      http("Post Data")
        .post("/data")
        .body(StringBody('{"firstName":"LoadTestUser","lastName":"PostUser","dateOfBirth":"1990-01-01","country":"UK","postalCode":"AB12CD"}'))
        .header("Authorization", `Bearer ${staticToken}`)
        .check(status().is(201))
    );
  
  setUp(scn.injectOpen(constantUsersPerSec(300).during(300))).protocols(httpProtocol);
});