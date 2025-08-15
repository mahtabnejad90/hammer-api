import http from 'k6/http';
import { check } from 'k6';

let token;

export function setup() {
  const loginRes = http.post('http://localhost:1990/login', JSON.stringify({ username: 'perfuser' }), {
    headers: { 'Content-Type': 'application/json' },
  });

  token = loginRes.json('token');
  return { token };
}

export const options = {
  scenarios: {
    post_load_test: {
      executor: 'constant-arrival-rate',
      rate: 300,
      timeUnit: '1s',
      duration: '300s',
      preAllocatedVUs: 150,
      maxVUs: 600,
    },
  },
};

export default function (data) {
  const payload = {
    firstName: `LoadTest${Math.floor(Math.random() * 100000)}`,
    lastName: "PostUser",
    dateOfBirth: "1990-01-01",
    country: "UK",
    postalCode: "AB12CD"
  };

  const res = http.post('http://localhost:1990/data', JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
    },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response has success': (r) => r.json('success') === true,
  });
}