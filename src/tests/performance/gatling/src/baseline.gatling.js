import { simulation, atOnceUsers, global, scenario, getParameter, pause, jmesPath, csv, feed, rampUsers, constantUsersPerSec } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";

export default simulation((setUp) => {

// http protocol
const httpProtocol = http
    .baseUrl("http://localhost:3000")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

// scenario
const scn1 = scenario("Get data from HammerAPI")
    .exec(http("GetAllData").get("/data")
        .check(status().is(200))
    )

// simulation configuration
setUp(
    scn1.injectOpen(constantUsersPerSec(100).during(50)).protocols(httpProtocol)
  );
})