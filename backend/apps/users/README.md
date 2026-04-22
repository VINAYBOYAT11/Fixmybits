# App: users

Handles authentication, user accounts, and role-specific profiles.

## Models

| Model            | Description                                      |
|------------------|--------------------------------------------------|
| `User`           | Custom user model (email as username, role-based)|
| `StartupProfile` | Extended profile for startup accounts            |
| `TesterProfile`  | Extended profile for tester accounts             |

## Roles

- `startup` — creates projects, reviews reports
- `tester` — applies to projects, submits bug reports
- `admin` — approves users/projects, reviews reports

## Endpoints (`/api/auth/`)

| Method | Path                        | Auth     | Description                    |
|--------|-----------------------------|----------|--------------------------------|
| POST   | `/register/`                | No       | Create account + return tokens |
| POST   | `/login/`                   | No       | Login, return JWT tokens       |
| POST   | `/logout/`                  | Yes      | Blacklist refresh token        |
| GET    | `/me/`                      | Yes      | Get current user info          |
| PATCH  | `/me/`                      | Yes      | Update current user profile    |
| POST   | `/password-reset/`          | No       | Request password reset email   |
| POST   | `/password-reset/confirm/`  | No       | Confirm reset with token       |
| POST   | `/contact/`                 | No       | Public contact form            |
| POST   | `/token/refresh/`           | No       | Refresh access token           |

## Permissions

| Class          | Description                              |
|----------------|------------------------------------------|
| `IsStartup`    | Authenticated + role == startup + not banned |
| `IsTester`     | Authenticated + role == tester + not banned  |
| `IsAdminRole`  | Authenticated + role == admin or is_staff    |
| `IsApprovedUser` | Authenticated + not banned               |
