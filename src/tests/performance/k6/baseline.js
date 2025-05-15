import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';

let token;

export function setup() {
  const loginRes = http.post('http://localhost:3000/login', JSON.stringify({ username: 'perfuser' }), {
    headers: { 'Content-Type': 'application/json' },
  });

  token = loginRes.json('token');

  for (let i = 0; i < 500; i++) {
    http.post('http://localhost:3000/data', JSON.stringify({
      firstName: `Test${i}`,
      lastName: "User",
      dateOfBirth: "1990-01-01",
      country: "UK",
      postalCode: "AB12CD"
    }), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return { token };
}

export const options = {
  scenarios: {
    constant_rate_test: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '50s',
      preAllocatedVUs: 50,
      maxVUs: 500,
    },
  },
};

export default function (data) {
  const res = http.get('http://localhost:3000/data', {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}