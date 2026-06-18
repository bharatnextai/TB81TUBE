type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type AuthUser = {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
};

type AuthData = {
  user: AuthUser;
  token: string;
};

const baseUrl = process.env.AUTH_SMOKE_BASE_URL ?? "http://localhost:4000";
const password = "password123";
const email = `tb81tube_test_${Date.now()}@example.com`;

async function requestJson<T>(
  label: string,
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`${label} could not reach ${baseUrl}. Make sure the backend dev server is running.`);
  }

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new Error(`${label} failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return body;
}

function assertAuthData(label: string, data: AuthData | undefined): AuthData {
  if (!data?.user?.id || !data.token) {
    throw new Error(`${label} did not return a user and token.`);
  }

  return data;
}

async function runAuthSmokeTest() {
  console.log(`Testing TB81TUBE auth API at ${baseUrl}`);
  console.log(`Using test email: ${email}`);

  const registerResponse = await requestJson<AuthData>("Register", "/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Test User",
      email,
      password,
    }),
  });

  const registerData = assertAuthData("Register", registerResponse.data);
  console.log(`Register passed for user id: ${registerData.user.id}`);

  const loginResponse = await requestJson<AuthData>("Login", "/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const loginData = assertAuthData("Login", loginResponse.data);
  console.log("Login passed and returned a JWT.");

  const meResponse = await requestJson<{ user: AuthUser }>("Auth me", "/api/v1/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  });

  if (meResponse.data?.user.email !== email) {
    throw new Error("Auth me returned a different user than the logged-in account.");
  }

  console.log(`Auth me passed for: ${meResponse.data.user.email}`);
  console.log("TB81TUBE auth smoke test passed.");
}

runAuthSmokeTest().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown auth smoke test error";

  console.error("TB81TUBE auth smoke test failed.");
  console.error(message);
  console.error("Check that PostgreSQL is running, migrations are applied, and the backend server is running.");

  process.exitCode = 1;
});
