import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    constant_rate_test: {
      executor: 'constant-arrival-rate',
      rate: 100,                 // 100 requests per second
      timeUnit: '1s',
      duration: '50s',           // 100 * 50 = 5000 requests
      preAllocatedVUs: 50,       // Adjust as needed based on response time
      maxVUs: 500,
    },
  },
};
  

export default function () {
  const res = http.get('http://localhost:3000/data');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
