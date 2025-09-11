# ip-add-geoloc-server

The backend for the IP address geolocation lookup client webapp.

## Key Features & Benefits

- **IP Address Geolocation:** Provides accurate geolocation data based on IP addresses.
- **RESTful API:** Offers a simple and easy-to-use RESTful API for accessing geolocation information.
- **Authentication:** Implements user authentication to protect API endpoints.
- **Scalable Architecture:** Built with Node.js and Express.js for efficient handling of requests.
- **Database Integration:** Uses MongoDB (via Mongoose) for persistent storage of user data and potentially geolocation cache.
- **Vercel Deployment:** Designed for easy deployment on Vercel.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

- **Node.js:** Version 16 or higher is recommended. Download from [nodejs.org](https://nodejs.org/).
- **npm:** Node Package Manager (usually included with Node.js).
- **MongoDB:** A MongoDB database instance (cloud or local).
- **Vercel CLI:** (Optional) For local development and deployment. Install with `npm install -g vercel`.

## Installation & Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/jbotmallen/ip-add-geoloc-server.git
    cd ip-add-geoloc-server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

        Create a `.env` file in the root directory of the project. Add the following environment variables, replacing the placeholders with your actual values:

        ```
        MONGODB_URI=<your_mongodb_connection_string>
        JWT_SECRET=<your_jwt_secret>
        SEED_TOKEN=<your_seed_token>
        SEED_USER_EMAIL=<your_seed_user_email>
        SEED_USER_PASSWORD=<your_seed_user_password>
        FRONTEND_URL=<your_frontend_url:port>
        PORT=<your_port_num>
        NODE_ENV=<dev ? prod ? stag>

        ```

        *   `MONGODB_URI`:  The connection string to your MongoDB database.
        *   `JWT_SECRET`: A secret key used for signing JSON Web Tokens (JWTs).  Choose a strong, random value.
        *   `SEED_TOKEN`: A secret token used to protect the `/api/admin/seed` endpoint.  Choose a strong, random value.
        *   `SEED_USER_EMAIL`: The email address for the initial seed user.
        *   `SEED_USER_PASSWORD`: The password for the initial seed user.
        *   `FRONTEND_URL`: The URL of your frontend application (for CORS).
        *   `PORT`: The port number the server will listen on (default is 8000).
        *   `NODE_ENV`: The environment the server is running in (e.g., development, production, staging).

4.  **Set up the database:**

    You can seed the database with an initial user by running the seed script. First, ensure your MongoDB instance is running and accessible.

    ```bash
    npm run seed
    ```

    This script sends a POST request to `http://localhost:8000/api/admin/seed` with the `x-seed-token` header set to your `SEED_TOKEN`. It will create an initial user with the specified email and password. You will likely need to run the development server first, see step 5. Make sure the `$SEEDTOKEN` environment variable is set when running the `seed` command. For example:

    ```bash
    SEEDTOKEN=<your_seed_token> npm run seed
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start the server in development mode with hot reloading using `tsx`. The server will listen on port 8000 (by default).

6.  **Deploy to Vercel:**

    1.  Initialize a Vercel project: `vercel` in the root directory.
    2.  Follow the prompts to link your project to your Vercel account.
    3.  Deploy: `vercel --prod`

## Usage Examples & API Documentation

### API Endpoints

- **`POST /api/auth/register`**: Registers a new user. Requires `email` and `password` in the request body.
- **`POST /api/auth/login`**: Logs in an existing user. Requires `email` and `password` in the request body. Returns a JWT token.
- **`GET /api/geolocation/:ipAddress`**: Retrieves geolocation data for the specified IP address. Requires a valid JWT token in the `Authorization` header (e.g., `Authorization: Bearer <token>`).

### Example Request (Geolocation Lookup)

```bash
curl -X GET http://localhost:8000/api/geolocation/8.8.8.8 \
-H "Authorization: Bearer <your_jwt_token>"
```

### Example Response

```json
{
  "ip": "8.8.8.8",
  "country_code": "US",
  "country_name": "United States",
  "region_code": "CA",
  "region_name": "California",
  "city": "Mountain View",
  "zip_code": "94043",
  "latitude": 37.422,
  "longitude": -122.084
}
```

## Configuration Options

The application is configured through environment variables. See the "Installation & Setup Instructions" section for details on setting these variables.

- **`MONGODB_URI`**: The connection string to your MongoDB database. Required.
- **`JWT_SECRET`**: A secret key used for signing JSON Web Tokens (JWTs). Required.
- **`SEED_TOKEN`**: A secret token used to protect the `/api/admin/seed` endpoint. Required.
- **`SEED_USER_EMAIL`**: The email address for the initial seed user. Required.
- **`SEED_USER_PASSWORD`**: The password for the initial seed user. Required.

## Contributing Guidelines

Contributions are welcome! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive commit messages.
4.  Test your changes thoroughly.
5.  Submit a pull request to the `main` branch.

## License Information

License is not specified. All rights reserved by the owner.

## Acknowledgments

This project utilizes the following open-source libraries:

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [cors](https://github.com/expressjs/cors)
- [helmet](https://helmetjs.github.io/)
- [compression](https://github.com/expressjs/compression)
- [dotenv](https://github.com/motdotla/dotenv)
